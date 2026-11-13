import numpy as np


def analyze_bayesian_ab_test(
    conversions_a,
    total_a,
    conversions_b,
    total_b,
    samples=2000,
    tune=1000
):
    """
    Bayesian A/B testing using the Beta-Binomial model.

    Uses a Beta(1, 1) prior for both groups.
    PyMC is not required.
    """

    # Validate inputs
    if total_a <= 0 or total_b <= 0:
        raise ValueError("Total users must be greater than zero.")

    if not 0 <= conversions_a <= total_a:
        raise ValueError("Invalid conversion count for Group A.")

    if not 0 <= conversions_b <= total_b:
        raise ValueError("Invalid conversion count for Group B.")

    if samples <= 0 or tune < 0:
        raise ValueError("Samples must be positive and tune non-negative.")

    # Convert inputs to integers
    conversions_a = int(conversions_a)
    total_a = int(total_a)
    conversions_b = int(conversions_b)
    total_b = int(total_b)
    samples = int(samples)

    # Beta(1, 1) prior distributions
    prior_alpha = 1
    prior_beta = 1

    # Calculate posterior parameters for Group A
    alpha_a = prior_alpha + conversions_a
    beta_a = prior_beta + total_a - conversions_a

    # Calculate posterior parameters for Group B
    alpha_b = prior_alpha + conversions_b
    beta_b = prior_beta + total_b - conversions_b

    # Generate reproducible posterior samples
    rng = np.random.default_rng(seed=42)

    rate_a = rng.beta(
        alpha_a,
        beta_a,
        size=samples
    )

    rate_b = rng.beta(
        alpha_b,
        beta_b,
        size=samples
    )

    # Calculate conversion rate difference
    difference = rate_b - rate_a

    # Calculate posterior summaries
    return {
        "group_a_conversion_rate": float(np.mean(rate_a)),

        "group_b_conversion_rate": float(np.mean(rate_b)),

        "probability_b_better": float(
            np.mean(rate_b > rate_a)
        ),

        "conversion_difference": float(
            np.mean(difference)
        ),

        "difference_credible_interval_95": [
            float(np.quantile(difference, 0.025)),
            float(np.quantile(difference, 0.975))
        ]
    }