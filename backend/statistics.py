import pandas as pd
from scipy.stats import ttest_ind, chi2_contingency


def analyze_ab_test(data):

    # Step 1: Check required columns
    required_columns = {
        "group",
        "converted",
        "revenue"
    }

    if not required_columns.issubset(data.columns):
        raise ValueError(
            "Dataset must contain group, converted, and revenue columns."
        )

    # Step 2: Check for missing values
    if data[list(required_columns)].isnull().any().any():
        raise ValueError(
            "Missing values must be handled before analysis."
        )

    # Step 3: Validate the group column
    if not set(data["group"].unique()).issubset({"A", "B"}):
        raise ValueError(
            "Group must contain only A and B."
        )

    if set(data["group"].unique()) != {"A", "B"}:
        raise ValueError(
            "Both groups A and B are required."
        )

    # Step 4: Validate conversion values
    if not data["converted"].isin([0, 1]).all():
        raise ValueError(
            "Converted must contain only 0 or 1."
        )

    # Step 5: Separate the two groups
    group_a = data[data["group"] == "A"]
    group_b = data[data["group"] == "B"]

    # Step 6: Calculate conversion rates
    conversion_a = group_a["converted"].mean()
    conversion_b = group_b["converted"].mean()

    # Step 7: Calculate average revenue
    revenue_a = group_a["revenue"].mean()
    revenue_b = group_b["revenue"].mean()

    # Step 8: Perform independent two-sample t-test
    t_statistic, t_p_value = ttest_ind(
        group_a["revenue"],
        group_b["revenue"],
        equal_var=False
    )

    # Step 9: Create a contingency table
    contingency_table = pd.crosstab(
        data["group"],
        data["converted"]
    ).reindex(
        index=["A", "B"],
        columns=[0, 1],
        fill_value=0
    )

    # Step 10: Perform chi-square test
    chi2_statistic, chi2_p_value, _, _ = chi2_contingency(
        contingency_table
    )

    # Step 11: Return the analysis results
    return {
        "control_users": int(len(group_a)),
        "treatment_users": int(len(group_b)),

        "control_conversion_rate": float(conversion_a),
        "treatment_conversion_rate": float(conversion_b),

        "conversion_difference_percentage_points": float(
            (conversion_b - conversion_a) * 100
        ),

        "control_average_revenue": float(revenue_a),
        "treatment_average_revenue": float(revenue_b),

        "t_test_statistic": float(t_statistic),
        "t_test_p_value": float(t_p_value),

        "chi_square_statistic": float(chi2_statistic),
        "chi_square_p_value": float(chi2_p_value)
    }