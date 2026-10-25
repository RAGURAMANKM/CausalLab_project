import pandas as pd

from backend.statistics import analyze_ab_test


# Load the simulated dataset
data = pd.read_csv("data/experiment_data.csv")

# Run the statistical analysis
results = analyze_ab_test(data)

# Display the results
print("\n========== A/B TEST RESULTS ==========")

print("\nNumber of users")
print("Group A:", results["control_users"])
print("Group B:", results["treatment_users"])

print("\nConversion rates")
print(
    "Group A:",
    round(results["control_conversion_rate"] * 100, 2),
    "%"
)

print(
    "Group B:",
    round(results["treatment_conversion_rate"] * 100, 2),
    "%"
)

print(
    "Conversion difference:",
    round(
        results["conversion_difference_percentage_points"],
        2
    ),
    "percentage points"
)

print("\nAverage revenue")
print(
    "Group A:",
    round(results["control_average_revenue"], 2)
)

print(
    "Group B:",
    round(results["treatment_average_revenue"], 2)
)

print("\nStatistical tests")
print("T-test p-value:", results["t_test_p_value"])
print("Chi-square p-value:", results["chi_square_p_value"])

print("\n======================================")