import numpy as np
import pandas as pd

from scipy.optimize import minimize


def analyze_synthetic_control(
    data,
    unit_column,
    time_column,
    outcome_column,
    treated_unit,
    intervention_time
):
    # Check required columns
    required_columns = [
        unit_column,
        time_column,
        outcome_column
    ]

    for column in required_columns:
        if column not in data.columns:
            raise ValueError(f"Missing required column: {column}")

    df = data[required_columns].dropna().copy()

    # Check the treated unit
    if treated_unit not in df[unit_column].unique():
        raise ValueError("Treated unit was not found in the data.")

    # Convert outcome to numeric
    df[outcome_column] = pd.to_numeric(
        df[outcome_column], errors="raise"
    )

    # Separate periods before and after intervention
    pre_data = df[df[time_column] < intervention_time]
    post_data = df[df[time_column] >= intervention_time]

    if pre_data.empty or post_data.empty:
        raise ValueError(
            "Data must contain observations before and after intervention."
        )

    # Calculate average outcomes for each unit before intervention
    pre_means = pre_data.groupby(unit_column)[outcome_column].mean()

    # Select control units that have pre-intervention observations
    control_units = [
        unit for unit in pre_means.index
        if unit != treated_unit
    ]

    if len(control_units) < 2:
        raise ValueError(
            "At least two control units are required."
        )

    # Calculate the treated unit's pre-intervention average
    treated_pre_mean = pre_means[treated_unit]

    # Calculate the pre-intervention averages for control units
    control_pre_means = pre_means[control_units].to_numpy()

    # Find non-negative weights that sum to one
    def objective(weights):
        synthetic_mean = np.dot(weights, control_pre_means)
        return (treated_pre_mean - synthetic_mean) ** 2

    initial_weights = np.ones(len(control_units)) / len(control_units)

    result = minimize(
        objective,
        initial_weights,
        method="SLSQP",
        bounds=[(0, 1)] * len(control_units),
        constraints={
            "type": "eq",
            "fun": lambda weights: np.sum(weights) - 1
        }
    )

    if not result.success:
        raise ValueError("Unable to calculate synthetic control weights.")

    weights = result.x

    # Calculate average post-intervention outcomes
    post_means = post_data.groupby(unit_column)[outcome_column].mean()

    # Keep control units available in the post-intervention period
    available_controls = [
        unit for unit in control_units
        if unit in post_means.index
    ]

    if not available_controls:
        raise ValueError(
            "No control units have post-intervention observations."
        )

    # Renormalize weights for controls with post-intervention data
    weight_lookup = dict(zip(control_units, weights))
    available_weights = np.array([
        weight_lookup[unit] for unit in available_controls
    ])

    if available_weights.sum() <= 0:
        raise ValueError(
            "Available control units have zero total weight."
        )

    available_weights = available_weights / available_weights.sum()

    # Estimate the synthetic control's post-intervention outcome
    synthetic_post_mean = np.dot(
        available_weights,
        post_means[available_controls].to_numpy()
    )

    treated_post_mean = post_means[treated_unit]

    # Estimate the intervention effect
    treatment_effect = treated_post_mean - synthetic_post_mean

    return {
        "treated_unit": str(treated_unit),
        "control_units": [str(unit) for unit in available_controls],
        "synthetic_control_weights": {
            str(unit): float(weight)
            for unit, weight in zip(
                available_controls,
                available_weights
            )
        },
        "treated_post_outcome": float(treated_post_mean),
        "synthetic_post_outcome": float(synthetic_post_mean),
        "estimated_treatment_effect": float(treatment_effect)
    }