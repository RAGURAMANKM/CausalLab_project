import math
from statistics import NormalDist


def analyze_sequential_test(looks, alpha=0.05):
    """
    Analyze A/B test conversion rates at multiple checkpoints.
    Uses Bonferroni correction to adjust for repeated testing.
    """

    if not 0 < alpha < 1:
        raise ValueError("Alpha must be between 0 and 1.")

    if not looks:
        raise ValueError("At least one checkpoint is required.")

    number_of_looks = len(looks)
    adjusted_alpha = alpha / number_of_looks

    # Validate checkpoints
    previous = None

    for index, look in enumerate(looks):
        conversions_a = look["conversions_a"]
        total_a = look["total_a"]
        conversions_b = look["conversions_b"]
        total_b = look["total_b"]

        if total_a <= 0 or total_b <= 0:
            raise ValueError("Total users must be greater than zero.")

        if not 0 <= conversions_a <= total_a:
            raise ValueError("Invalid Group A conversion count.")

        if not 0 <= conversions_b <= total_b:
            raise ValueError("Invalid Group B conversion count.")

        if previous is not None:
            if total_a < previous["total_a"]:
                raise ValueError("Group A totals cannot decrease.")

            if total_b < previous["total_b"]:
                raise ValueError("Group B totals cannot decrease.")

            if conversions_a < previous["conversions_a"]:
                raise ValueError("Group A conversions cannot decrease.")

            if conversions_b < previous["conversions_b"]:
                raise ValueError("Group B conversions cannot decrease.")

            if (
                total_a == previous["total_a"]
                and total_b == previous["total_b"]
            ):
                raise ValueError(
                    "Each checkpoint must include additional users."
                )

        previous = look

    results = []
    stopping_look = None
    normal = NormalDist()

    # Analyze checkpoints in order
    for index, look in enumerate(looks):
        conversions_a = look["conversions_a"]
        total_a = look["total_a"]
        conversions_b = look["conversions_b"]
        total_b = look["total_b"]

        rate_a = conversions_a / total_a
        rate_b = conversions_b / total_b
        difference = rate_b - rate_a

        # Pooled conversion rate
        pooled_rate = (
            conversions_a + conversions_b
        ) / (
            total_a + total_b
        )

        standard_error = math.sqrt(
            pooled_rate
            * (1 - pooled_rate)
            * (1 / total_a + 1 / total_b)
        )

        # Calculate z-statistic and p-value
        if standard_error == 0:
            if difference == 0:
                z_statistic = 0.0
                p_value = 1.0
            else:
                z_statistic = None
                p_value = 0.0
        else:
            z_statistic = difference / standard_error

            p_value = 2 * (
                1 - normal.cdf(abs(z_statistic))
            )

            p_value = max(0.0, min(1.0, p_value))

        significant = p_value <= adjusted_alpha

        if rate_b > rate_a:
            winner = "B"
        elif rate_a > rate_b:
            winner = "A"
        else:
            winner = "Tie"

        results.append({
            "look": index + 1,
            "total_a": total_a,
            "conversions_a": conversions_a,
            "conversion_rate_a": rate_a,
            "total_b": total_b,
            "conversions_b": conversions_b,
            "conversion_rate_b": rate_b,
            "conversion_difference": difference,
            "z_statistic": z_statistic,
            "p_value": p_value,
            "adjusted_alpha": adjusted_alpha,
            "significant": significant,
            "observed_winner": winner
        })

        if significant:
            stopping_look = index + 1
            break

    if stopping_look is not None:
        final_result = results[-1]

        decision = (
            f"Statistically significant at checkpoint {stopping_look}. "
            f"Group {final_result['observed_winner']} has the higher "
            "observed conversion rate."
        )

        stop_reason = "statistical_significance"
    else:
        decision = (
            "No statistically significant result was found. "
            "Consider continuing to the next planned checkpoint."
        )

        stop_reason = "no_significance"

    return {
        "method": "Bonferroni-corrected sequential testing",
        "alpha": alpha,
        "number_of_planned_looks": number_of_looks,
        "looks_analyzed": len(results),
        "adjusted_alpha_per_look": adjusted_alpha,
        "stopped_early": (
            stopping_look is not None
            and stopping_look < number_of_looks
        ),
        "stopping_look": stopping_look,
        "stop_reason": stop_reason,
        "decision": decision,
        "results": results
    }