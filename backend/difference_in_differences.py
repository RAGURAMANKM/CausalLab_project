import pandas as pd
import statsmodels.formula.api as smf


def analyze_difference_in_differences(
    data,
    treatment_column,
    time_column,
    outcome_column
):
    # Check whether the required columns exist
    required_columns = [
        treatment_column,
        time_column,
        outcome_column
    ]

    for column in required_columns:
        if column not in data.columns:
            raise ValueError(f"Missing required column: {column}")

    # Keep the required columns and remove missing values
    df = data[required_columns].dropna().copy()

    # Check that treatment and control groups exist
    if set(df[treatment_column].unique()) != {0, 1}:
        raise ValueError(
            "Treatment column must contain both 0 and 1."
        )

    # Check that before and after periods exist
    if set(df[time_column].unique()) != {0, 1}:
        raise ValueError(
            "Time column must contain both 0 and 1."
        )

    # Convert treatment, time, and outcome into numeric values
    df[treatment_column] = pd.to_numeric(
        df[treatment_column], errors="raise"
    )

    df[time_column] = pd.to_numeric(
        df[time_column], errors="raise"
    )

    df[outcome_column] = pd.to_numeric(
        df[outcome_column], errors="raise"
    )

    # Rename columns for a simpler regression formula
    df = df.rename(columns={
        treatment_column: "treatment",
        time_column: "post",
        outcome_column: "outcome"
    })

    # Estimate the DiD model
    model = smf.ols(
        "outcome ~ treatment * post",
        data=df
    ).fit()

    # The interaction coefficient is the DiD estimate
    did_effect = model.params["treatment:post"]
    confidence_interval = model.conf_int().loc["treatment:post"]
    p_value = model.pvalues["treatment:post"]

    return {
        "rows_used": int(len(df)),
        "treatment_effect": float(did_effect),
        "confidence_interval_95": [
            float(confidence_interval.iloc[0]),
            float(confidence_interval.iloc[1])
        ],
        "p_value": float(p_value),
        "r_squared": float(model.rsquared)
    }