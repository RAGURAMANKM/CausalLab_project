from backend.sequential_testing import analyze_sequential_test


# P-values collected at five interim analyses
p_values = [
    0.030,
    0.015,
    0.008,
    0.020,
    0.004
]

result = analyze_sequential_test(
    p_values=p_values,
    alpha=0.05,
    planned_looks=5
)

print("\nSEQUENTIAL TESTING RESULTS")
print("=" * 50)

print("Overall significance level:", result["overall_alpha"])
print("Planned interim analyses:", result["planned_looks"])
print("Adjusted alpha:", result["adjusted_alpha"])

for look in result["results"]:
    print(f"\nInterim analysis {look['look_number']}")
    print("P-value:", look["p_value"])
    print("Adjusted alpha:", look["adjusted_alpha"])
    print("Statistically significant:", look["significant"])