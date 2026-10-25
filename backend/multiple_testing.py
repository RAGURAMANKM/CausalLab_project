from statsmodels.stats.multitest import multipletests


def correct_p_values(p_values, alpha=0.05):

    if not p_values:
        raise ValueError("Provide at least one p-value.")

    if not 0 < alpha < 1:
        raise ValueError("Alpha must be between 0 and 1.")

    for p_value in p_values:
        if not 0 <= p_value <= 1:
            raise ValueError(
                "Each p-value must be between 0 and 1."
            )

    # Bonferroni correction
    bonferroni_reject, bonferroni_p_values, _, _ = (
        multipletests(
            p_values,
            alpha=alpha,
            method="bonferroni"
        )
    )

    # Benjamini-Hochberg correction
    bh_reject, bh_p_values, _, _ = multipletests(
        p_values,
        alpha=alpha,
        method="fdr_bh"
    )

    results = []

    for i, p_value in enumerate(p_values):

        results.append({
            "original_p_value": float(p_value),

            "bonferroni_adjusted_p_value": float(
                bonferroni_p_values[i]
            ),

            "bonferroni_significant": bool(
                bonferroni_reject[i]
            ),

            "bh_adjusted_p_value": float(
                bh_p_values[i]
            ),

            "bh_significant": bool(
                bh_reject[i]
            )
        })

    return results