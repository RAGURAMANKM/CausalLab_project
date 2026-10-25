import pymc as pm
import numpy as np


def analyze_bayesian_ab_test(
    conversions_a,
    total_a,
    conversions_b,
    total_b,
    samples=2000,
    tune=1000
):
    # Validate the input
    if total_a <= 0 or total_b <= 0:
        raise ValueError("Total users must be greater than zero.")

    if not 0 <= conversions_a <= total_a:
        raise ValueError("Invalid conversion count for Group A.")

    if not 0 <= conversions_b <= total_b:
        raise ValueError("Invalid conversion count for Group B.")

    if samples <= 0 or tune < 0:
        raise ValueError("Samples must be positive and tune non-negative.")

    # Build the Bayesian model
    with pm.Model() as model:

        # Prior distributions for conversion rates
        conversion_rate_a = pm.Beta(
            "conversion_rate_a",
            alpha=1,
            beta=1
        )

        conversion_rate_b = pm.Beta(
            "conversion_rate_b",
            alpha=1,
            beta=1
        )

        # Observed conversion data
        pm.Binomial(
            "observed_a",
            n=total_a,
            p=conversion_rate_a,
            observed=conversions_a
        )

        pm.Binomial(
            "observed_b",
            n=total_b,
            p=conversion_rate_b,
            observed=conversions_b
        )

        # Estimate posterior distributions
        trace = pm.sample(
            draws=samples,
            tune=tune,
            chains=2,
            cores=1,
            random_seed=42,
            progressbar=False
        )

    # Extract posterior samples
    rate_a = trace.posterior["conversion_rate_a"].values.flatten()
    rate_b = trace.posterior["conversion_rate_b"].values.flatten()

    # Calculate the difference between conversion rates
    difference = rate_b - rate_a

    # Summarize the results
    return {
        "group_a_conversion_rate": float(np.mean(rate_a)),
        "group_b_conversion_rate": float(np.mean(rate_b)),
        "probability_b_better": float(np.mean(rate_b > rate_a)),
        "conversion_difference": float(np.mean(difference)),
        "difference_credible_interval_95": [
            float(np.quantile(difference, 0.025)),
            float(np.quantile(difference, 0.975))
        ]
    }