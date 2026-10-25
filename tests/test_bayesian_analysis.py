from backend.bayesian_analysis import analyze_bayesian_ab_test


print("\nBAYESIAN A/B TESTING")
print("=" * 50)

result = analyze_bayesian_ab_test(
    conversions_a=98,
    total_a=1000,
    conversions_b=139,
    total_b=1000,
    samples=1000,
    tune=500
)

print("\nGroup A conversion rate:")
print(round(result["group_a_conversion_rate"] * 100, 2), "%")

print("\nGroup B conversion rate:")
print(round(result["group_b_conversion_rate"] * 100, 2), "%")

print("\nProbability that Group B is better:")
print(round(result["probability_b_better"] * 100, 2), "%")

print("\nEstimated conversion-rate difference:")
print(round(result["conversion_difference"] * 100, 2), "percentage points")

lower, upper = result["difference_credible_interval_95"]

print("\n95% credible interval for the difference:")
print(
    round(lower * 100, 2),
    "to",
    round(upper * 100, 2),
    "percentage points"
)