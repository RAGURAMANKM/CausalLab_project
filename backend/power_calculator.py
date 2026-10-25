from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize


def calculate_sample_size(
    baseline_rate=0.10,
    target_rate=0.13,
    alpha=0.05,
    power=0.80
):
    # Validate the conversion rates
    if not 0 < baseline_rate < 1:
        raise ValueError(
            "Baseline rate must be between 0 and 1."
        )

    if not 0 < target_rate < 1:
        raise ValueError(
            "Target rate must be between 0 and 1."
        )

    if baseline_rate == target_rate:
        raise ValueError(
            "Baseline and target rates must be different."
        )

    if not 0 < alpha < 1:
        raise ValueError(
            "Alpha must be between 0 and 1."
        )

    if not 0 < power < 1:
        raise ValueError(
            "Power must be between 0 and 1."
        )

    # Calculate the standardized effect size
    effect_size = abs(
        proportion_effectsize(
            baseline_rate,
            target_rate
        )
    )

    # Create the power calculator
    calculator = NormalIndPower()

    # Calculate sample size for each group
    sample_size = calculator.solve_power(
        effect_size=effect_size,
        power=power,
        alpha=alpha,
        ratio=1.0,
        alternative="two-sided"
    )

    # Round up to the next whole participant
    sample_size = int(sample_size) + (
        int(sample_size) != sample_size
    )

    return {
        "baseline_rate": baseline_rate,
        "target_rate": target_rate,
        "alpha": alpha,
        "power": power,
        "sample_size_per_group": sample_size,
        "total_sample_size": sample_size * 2
    }