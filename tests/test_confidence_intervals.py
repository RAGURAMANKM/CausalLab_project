from backend.confidence_intervals import (
    calculate_conversion_confidence_interval
)


# Group A: 98 conversions out of 1000 users
group_a = calculate_conversion_confidence_interval(
    conversions=98,
    total_users=1000
)

# Group B: 139 conversions out of 1000 users
group_b = calculate_conversion_confidence_interval(
    conversions=139,
    total_users=1000
)


print("\nCONFIDENCE INTERVAL ANALYSIS")
print("=" * 50)

print("\nGroup A")
print("Conversion rate:", round(group_a["conversion_rate"] * 100, 2), "%")
print("95% confidence interval:",
      round(group_a["lower_bound"] * 100, 2), "% to",
      round(group_a["upper_bound"] * 100, 2), "%")

print("\nGroup B")
print("Conversion rate:", round(group_b["conversion_rate"] * 100, 2), "%")
print("95% confidence interval:",
      round(group_b["lower_bound"] * 100, 2), "% to",
      round(group_b["upper_bound"] * 100, 2), "%")

from backend.confidence_intervals import (
    calculate_conversion_difference_ci
)


difference_result = calculate_conversion_difference_ci(
    conversions_a=98,
    total_a=1000,
    conversions_b=139,
    total_b=1000
)

print("\nCONVERSION DIFFERENCE ANALYSIS")
print("=" * 50)

print(
    "Conversion difference:",
    round(difference_result["difference"] * 100, 2),
    "percentage points"
)

print(
    "95% confidence interval:",
    round(difference_result["lower_bound"] * 100, 2),
    "to",
    round(difference_result["upper_bound"] * 100, 2),
    "percentage points"
)


def test_conversion_confidence_interval():
    result = calculate_conversion_confidence_interval(
        conversions=98,
        total_users=1000
    )

    assert result["conversion_rate"] == 0.098

    assert result["lower_bound"] < result["upper_bound"]

    assert result["lower_bound"] < result["conversion_rate"]

    assert result["upper_bound"] > result["conversion_rate"]


def test_conversion_difference():
    result = calculate_conversion_difference_ci(
        conversions_a=98,
        total_a=1000,
        conversions_b=139,
        total_b=1000
    )

    assert round(result["difference"], 3) == 0.041

    assert result["lower_bound"] < result["upper_bound"]


def test_invalid_total_users():
    try:
        calculate_conversion_confidence_interval(
            conversions=10,
            total_users=0
        )
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Expected ValueError for zero total users."
        )