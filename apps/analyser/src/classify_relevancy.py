#!/usr/bin/env python3
import os
import sys

from supabase import create_client

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'http://127.0.0.1:54321')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
HF_TOKEN = os.environ.get('HUGGINGFACE_TOKEN')
MODEL_NAME = 'dufftie/gemma3-270m-classify-if-estonian-politics'
BATCH_SIZE = 100

SYSTEM_PROMPT = "Does this article mention Estonian politicians or political parties? Answer only 'true' or 'false'"

def load_model():
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    print(f"Loading model: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, token=HF_TOKEN)
    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype="auto", token=HF_TOKEN)
    model.eval()
    return tokenizer, model


def classify(tokenizer, model, title, body):
    import torch

    text = (
        f"{SYSTEM_PROMPT}\n\n"
        f"{title}\n\n{body}"
    )
    inputs = tokenizer(text, return_tensors="pt")
    input_ids = inputs["input_ids"]
    attention_mask = inputs["attention_mask"]

    with torch.no_grad():
        outputs = model.generate(
            input_ids,
            attention_mask=attention_mask,
            max_new_tokens=5,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id,
        )

    new_tokens = outputs[0][input_ids.shape[1]:]
    response = tokenizer.decode(new_tokens, skip_special_tokens=True).strip().lower()
    return response.startswith('true')


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    tokenizer, model = load_model()

    print(f"Batch size: {BATCH_SIZE}\n")

    last_id = 0
    total_processed = 0
    total_relevant = 0
    total_errors = 0

    while True:
        result = (
            supabase.table('articles')
            .select('id, title, body')
            .gt('id', last_id)
            .eq('paywall', False)
            .order('id')
            .limit(BATCH_SIZE)
            .execute()
        )
        articles = result.data
        if not articles:
            break

        last_id = articles[-1]['id']

        ids = [a['id'] for a in articles]
        done_result = (
            supabase.table('article_relevancy')
            .select('ref_id')
            .in_('ref_id', ids)
            .execute()
        )
        done_ids = {r['ref_id'] for r in done_result.data}
        pending = [a for a in articles if a['id'] not in done_ids]

        if not pending:
            continue

        for article in pending:
            try:
                is_relevant = classify(tokenizer, model, article['title'], article['body'])

                supabase.table('article_relevancy').insert({
                    'ref_id': article['id'],
                    'is_relevant': is_relevant,
                }).execute()

                total_processed += 1
                if is_relevant:
                    total_relevant += 1

                status = 'yes' if is_relevant else 'no '
                print(f"[{total_processed}] #{article['id']} {status} {article['title'][:65]}")

            except Exception as e:
                total_errors += 1
                import traceback
                print(f"  ERR #{article['id']}: {type(e).__name__}: {e}", file=sys.stderr)
                if total_errors == 1:
                    traceback.print_exc(file=sys.stderr)

    print(f"\nprocessed={total_processed} relevant={total_relevant} errors={total_errors}")


if __name__ == '__main__':
    main()