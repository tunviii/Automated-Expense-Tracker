from server.main import predict_category, PredictRequest

req = PredictRequest(raw_text="ICICI Bank Acct debited for Rs 450; SWIGGY credited.")
result = predict_category(req)
print("Result Category:", result.category)
print("Result Confidence:", result.confidence)
print("Top Categories:", result.top_categories)
