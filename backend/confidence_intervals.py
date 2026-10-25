from statsmodels.stats.proportion import proportion_confint
from statsmodels.stats.proportion import confint_proportions_2indep


def calculate_conversion_confidence_interval(
    conversions,
    total_users,
    alpha=0.05
):
    if total_users <= 0:
        raise ValueError("Total users must be greater than zero.")

    if conversions < 0 or conversions > total_users:
        raise ValueError(
            "Conversions must be between zero and total users."
        )

    if not 0 < alpha < 1:
        raise ValueError("Alpha must be between 0 and 1.")

    lower, upper = proportion_confint(
        count=conversions,
        nobs=total_users,
        alpha=alpha,
        method="wilson"
    )

    return {
        "conversion_rate": conversions / total_users,
        "confidence_level": 1 - alpha,
        "lower_bound": float(lower),
        "upper_bound": float(upper)
    }



def calculate_conversion_difference_ci(
    conversions_a,
    total_a,
    conversions_b,
    total_b,
    alpha=0.05
):
    if total_a <= 0 or total_b <= 0:
        raise ValueError("Total users must be greater than zero.")

    if not 0 <= conversions_a <= total_a:
        raise ValueError("Invalid conversion count for Group A.")

    if not 0 <= conversions_b <= total_b:
        raise ValueError("Invalid conversion count for Group B.")

    if not 0 < alpha < 1:
        raise ValueError("Alpha must be between 0 and 1.")

    rate_a = conversions_a / total_a
    rate_b = conversions_b / total_b

    difference = rate_b - rate_a

    lower, upper = confint_proportions_2indep(
        count1=conversions_b,
        nobs1=total_b,
        count2=conversions_a,
        nobs2=total_a,
        method="newcomb",
        compare="diff",
        alpha=alpha
    )

    return {
        "group_a_conversion_rate": rate_a,
        "group_b_conversion_rate": rate_b,
        "difference": difference,
        "confidence_level": 1 - alpha,
        "lower_bound": float(lower),
        "upper_bound": float(upper)
    }