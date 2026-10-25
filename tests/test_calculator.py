from backend.power_calculator import calculate_sample_size


result = calculate_sample_size(
    baseline_rate=0.10,
    target_rate=0.13,
    alpha=0.05,
    power=0.80
)

print("A/B Test Sample-Size Calculation")
print("--------------------------------")
print("Baseline rate:", result["baseline_rate"])
print("Target rate:", result["target_rate"])
print("Required per group:", result["sample_size_per_group"])
print("Total sample size:", result["total_sample_size"])