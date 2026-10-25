from backend.multiple_testing import correct_p_values


# Example p-values from five statistical tests
p_values = [
    0.001,
    0.010,
    0.030,
    0.040,
    0.200
]

results = correct_p_values(
    p_values,
    alpha=0.05
)

print("\nMULTIPLE-TESTING CORRECTION")
print("=" * 65)

for index, result in enumerate(results, start=1):

    print(f"\nTest {index}")

    print(
        "Original p-value:",
        round(result["original_p_value"], 4)
    )

    print(
        "Bonferroni adjusted p-value:",
        round(result["bonferroni_adjusted_p_value"], 4)
    )

    print(
        "Bonferroni significant:",
        result["bonferroni_significant"]
    )

    print(
        "BH adjusted p-value:",
        round(result["bh_adjusted_p_value"], 4)
    )

    print(
        "BH significant:",
        result["bh_significant"]
    )