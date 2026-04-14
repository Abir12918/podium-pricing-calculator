const presetOptions = [80, 90, 100, 110, 120];
const PARTNER_COUNT = 2;
const WEEKS_PER_MONTH = 4;

function getMonthlyHours(hoursPerWeek) {
  return hoursPerWeek * WEEKS_PER_MONTH;
}

function getTutorMonthlyCost(monthlyHours, tutorPayPerHour) {
  return monthlyHours * tutorPayPerHour;
}

function getTotalPartnerProfit(profitPerPerson) {
  return profitPerPerson * PARTNER_COUNT;
}

function getParentMonthlyPrice(tutorMonthlyCost, totalPartnerProfit) {
  return tutorMonthlyCost + totalPartnerProfit;
}

function getParentHourlyRate(parentMonthlyPrice, monthlyHours) {
  if (!monthlyHours) return 0;
  return parentMonthlyPrice / monthlyHours;
}

function isValidNumber(value) {
  return Number.isFinite(value) && value >= 0;
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "—";
  const isWhole = Math.abs(value - Math.round(value)) < 0.0001;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatHourlyRate(value) {
  if (!Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}/hr`;
}

function getCalculation(hours, pay, profit) {
  if (
    !isValidNumber(hours) ||
    !isValidNumber(pay) ||
    !isValidNumber(profit) ||
    hours <= 0 ||
    pay <= 0
  ) {
    return null;
  }

  const monthlyHours = getMonthlyHours(hours);
  const tutorMonthlyCost = getTutorMonthlyCost(monthlyHours, pay);
  const totalPartnerProfit = getTotalPartnerProfit(profit);
  const parentMonthlyPrice = getParentMonthlyPrice(tutorMonthlyCost, totalPartnerProfit);
  const parentHourlyRate = getParentHourlyRate(parentMonthlyPrice, monthlyHours);

  return {
    monthlyHours,
    tutorMonthlyCost,
    totalPartnerProfit,
    parentMonthlyPrice,
    parentHourlyRate,
    profitPerPerson: profit
  };
}

function updateQuickQuote() {
  const hours = parseFloat(document.getElementById("qq-hours").value);
  const pay = parseFloat(document.getElementById("qq-pay").value);
  const tbody = document.getElementById("qq-table");

  tbody.innerHTML = "";

  presetOptions.forEach((profit) => {
    const result = getCalculation(hours, pay, profit);

    const row = document.createElement("tr");

    if (!result) {
      row.innerHTML = `
        <td>${formatCurrency(profit)}</td>
        <td>—</td>
        <td>—</td>
        <td class="price-cell">—</td>
        <td>—</td>
      `;
    } else {
      row.innerHTML = `
        <td>${formatCurrency(profit)}</td>
        <td>${formatCurrency(result.totalPartnerProfit)}</td>
        <td>${formatCurrency(result.tutorMonthlyCost)}</td>
        <td class="price-cell">${formatCurrency(result.parentMonthlyPrice)}</td>
        <td>${formatHourlyRate(result.parentHourlyRate)}</td>
      `;
    }

    tbody.appendChild(row);
  });
}

function updateCustomCalculator() {
  const hours = parseFloat(document.getElementById("hours").value);
  const pay = parseFloat(document.getElementById("pay").value);
  const profit = parseFloat(document.getElementById("profit").value);

  const result = getCalculation(hours, pay, profit);

  if (!result) {
    document.getElementById("mh").textContent = "—";
    document.getElementById("tc").textContent = "—";
    document.getElementById("pp").textContent = "—";
    document.getElementById("tp").textContent = "—";
    document.getElementById("pm").textContent = "—";
    document.getElementById("hr").textContent = "—";
    document.getElementById("formula").innerHTML = `
      Enter valid values to see the live breakdown.
    `;
    return;
  }

  document.getElementById("mh").textContent = result.monthlyHours;
  document.getElementById("tc").textContent = formatCurrency(result.tutorMonthlyCost);
  document.getElementById("pp").textContent = formatCurrency(result.profitPerPerson);
  document.getElementById("tp").textContent = formatCurrency(result.totalPartnerProfit);
  document.getElementById("pm").textContent = formatCurrency(result.parentMonthlyPrice);
  document.getElementById("hr").textContent = formatHourlyRate(result.parentHourlyRate);

  document.getElementById("formula").innerHTML = `
    <strong>Monthly hours</strong> = ${hours} × ${WEEKS_PER_MONTH} = ${result.monthlyHours}<br>
    <strong>Tutor monthly cost</strong> = ${result.monthlyHours} × ${formatCurrency(pay)} = ${formatCurrency(result.tutorMonthlyCost)}<br>
    <strong>Total partner profit</strong> = ${formatCurrency(profit)} × ${PARTNER_COUNT} = ${formatCurrency(result.totalPartnerProfit)}<br>
    <strong>Parent monthly price</strong> = ${formatCurrency(result.tutorMonthlyCost)} + ${formatCurrency(result.totalPartnerProfit)} = ${formatCurrency(result.parentMonthlyPrice)}<br>
    <strong>Parent hourly rate</strong> = ${formatCurrency(result.parentMonthlyPrice)} ÷ ${result.monthlyHours} = ${formatHourlyRate(result.parentHourlyRate)}
  `;
}

function syncPresetProfit() {
  const preset = document.getElementById("preset-profit").value;
  const profitInput = document.getElementById("profit");

  if (preset !== "custom") {
    profitInput.value = preset;
  }

  updateCustomCalculator();
}

function attachListeners() {
  document.getElementById("qq-hours").addEventListener("input", updateQuickQuote);
  document.getElementById("qq-pay").addEventListener("input", updateQuickQuote);

  document.getElementById("hours").addEventListener("input", updateCustomCalculator);
  document.getElementById("pay").addEventListener("input", updateCustomCalculator);
  document.getElementById("profit").addEventListener("input", () => {
    document.getElementById("preset-profit").value = "custom";
    updateCustomCalculator();
  });
  document.getElementById("preset-profit").addEventListener("change", syncPresetProfit);
}

attachListeners();
updateQuickQuote();
updateCustomCalculator();