from pathlib import Path
import numpy as np
import pandas as pd


def generate_ab_data(
    n_per_group=1000,
    control_rate=0.10,
    treatment_rate=0.13,
    seed=42
):
    if n_per_group <= 0:
        raise ValueError("Sample size must be positive.")

    if not 0 <= control_rate <= 1:
        raise ValueError("Control rate must be between 0 and 1.")

    if not 0 <= treatment_rate <= 1:
        raise ValueError("Treatment rate must be between 0 and 1.")

    rng = np.random.default_rng(seed)

    # Generate conversion outcomes
    control_conversions = rng.binomial(
        1, control_rate, n_per_group
    )

    treatment_conversions = rng.binomial(
        1, treatment_rate, n_per_group
    )

    # Generate revenue for each customer
    control_revenue = (
        control_conversions
        * rng.normal(250, 50, n_per_group)
    )

    treatment_revenue = (
        treatment_conversions
        * rng.normal(280, 60, n_per_group)
    )

    # Create control-group dataset
    control = pd.DataFrame({
        "user_id": range(1, n_per_group + 1),
        "group": "A",
        "converted": control_conversions,
        "revenue": control_revenue
    })

    # Create treatment-group dataset
    treatment = pd.DataFrame({
        "user_id": range(
            n_per_group + 1,
            2 * n_per_group + 1
        ),
        "group": "B",
        "converted": treatment_conversions,
        "revenue": treatment_revenue
    })

    # Combine both groups
    data = pd.concat(
        [control, treatment],
        ignore_index=True
    )

    return data


if __name__ == "__main__":
    data = generate_ab_data()

    # Create the data folder if it doesn't exist
    data_folder = Path("data")
    data_folder.mkdir(parents=True, exist_ok=True)

    # Save the dataset
    file_path = data_folder / "experiment_data.csv"
    data.to_csv(file_path, index=False)

    print("Dataset generated successfully!")
    print("Saved location:", file_path.resolve())
    print("Total rows:", len(data))
    print("\nFirst five rows:")
    print(data.head())

    print("\nConversion rates:")
    print(data.groupby("group")["converted"].mean())