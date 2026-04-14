const PRESET_OPTIONS = [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
const PARTNER_COUNT = 2;
const WEEKS_PER_MONTH = 4;

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
    maximumFractionDigits: 2,
  }).format(value);
}

function formatHourlyRate(value) {
  if (!Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}/hr`;
}

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

function getCustomCalculation(hours, pay, profit) {
  if (!isValidNumber(hours) || !isValidNumber(pay) || !isValidNumber(profit) || hours <= 0 || pay <= 0) {
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
    profitPerPerson: profit,
  };
}

function getGroupCalculation(students, chargePerStudent, pay, hours) {
  if (
    !isValidNumber(students) ||
    !isValidNumber(chargePerStudent) ||
    !isValidNumber(pay) ||
    !isValidNumber(hours) ||
    students <= 0 ||
    hours <= 0
  ) {
    return null;
  }

  const monthlyHours = getMonthlyHours(hours);
  const totalRevenue = students * chargePerStudent;
  const tutorMonthlyCost = monthlyHours * pay;
  const totalProfit = totalRevenue - tutorMonthlyCost;
  const profitEach = totalProfit / PARTNER_COUNT;

  return {
    monthlyHours,
    totalRevenue,
    tutorMonthlyCost,
    totalProfit,
    profitEach,
    chargePerStudent,
  };
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });
}

function updateQuickQuote() {
  const hours = parseFloat(document.getElementById("qq-hours").value);
  const pay = parseFloat(document.getElementById("qq-pay").value);
  const tableBody = document.getElementById("qq-table");
  tableBody.innerHTML = "";

  PRESET_OPTIONS.forEach((profit) => {
    const row = document.createElement("tr");
    const result = getCustomCalculation(hours, pay, profit);

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

    tableBody.appendChild(row);
  });
}

function updateCustomCalculator() {
  const hours = parseFloat(document.getElementById("hours").value);
  const pay = parseFloat(document.getElementById("pay").value);
  const profit = parseFloat(document.getElementById("profit").value);

  const result = getCustomCalculation(hours, pay, profit);

  if (!result) {
    document.getElementById("mh").textContent = "—";
    document.getElementById("tc").textContent = "—";
    document.getElementById("pp").textContent = "—";
    document.getElementById("tp").textContent = "—";
    document.getElementById("pm").textContent = "—";
    document.getElementById("hr").textContent = "—";
    document.getElementById("formula").innerHTML = "Enter valid values to see the live breakdown.";
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

function updateGroupCalculator() {
  const students = parseFloat(document.getElementById("group-students").value);
  const charge = parseFloat(document.getElementById("group-charge").value);
  const pay = parseFloat(document.getElementById("group-pay").value);
  const hours = parseFloat(document.getElementById("group-hours").value);

  const result = getGroupCalculation(students, charge, pay, hours);

  const profitCard = document.getElementById("g-profit-card");
  const abirCard = document.getElementById("g-abir-card");
  const rahatCard = document.getElementById("g-rahat-card");

  profitCard.classList.remove("negative");
  abirCard.classList.remove("negative");
  rahatCard.classList.remove("negative");

  if (!result) {
    document.getElementById("g-mh").textContent = "—";
    document.getElementById("g-tuition").textContent = "—";
    document.getElementById("g-revenue").textContent = "—";
    document.getElementById("g-cost").textContent = "—";
    document.getElementById("g-profit").textContent = "—";
    document.getElementById("g-abir").textContent = "—";
    document.getElementById("g-rahat").textContent = "—";
    document.getElementById("group-formula").innerHTML = "Enter valid values to see the live breakdown.";
    return;
  }

  if (result.totalProfit < 0) {
    profitCard.classList.add("negative");
    abirCard.classList.add("negative");
    rahatCard.classList.add("negative");
  }

  document.getElementById("g-mh").textContent = result.monthlyHours;
  document.getElementById("g-tuition").textContent = formatCurrency(result.chargePerStudent);
  document.getElementById("g-revenue").textContent = formatCurrency(result.totalRevenue);
  document.getElementById("g-cost").textContent = formatCurrency(result.tutorMonthlyCost);
  document.getElementById("g-profit").textContent = formatCurrency(result.totalProfit);
  document.getElementById("g-abir").textContent = formatCurrency(result.profitEach);
  document.getElementById("g-rahat").textContent = formatCurrency(result.profitEach);

  document.getElementById("group-formula").innerHTML = `
    <strong>Monthly hours</strong> = ${hours} × ${WEEKS_PER_MONTH} = ${result.monthlyHours}<br>
    <strong>Monthly tuition</strong> = ${formatCurrency(charge)} per student<br>
    <strong>Monthly revenue</strong> = ${formatCurrency(charge)} × ${students} = ${formatCurrency(result.totalRevenue)}<br>
    <strong>Tutor monthly cost</strong> = ${result.monthlyHours} × ${formatCurrency(pay)} = ${formatCurrency(result.tutorMonthlyCost)}<br>
    <strong>Total earnings</strong> = ${formatCurrency(result.totalRevenue)} − ${formatCurrency(result.tutorMonthlyCost)} = ${formatCurrency(result.totalProfit)}<br>
    <strong>Each takeaway</strong> = ${formatCurrency(result.totalProfit)} ÷ ${PARTNER_COUNT} = ${formatCurrency(result.profitEach)}
  `;
}

function attachListeners() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  document.getElementById("qq-hours").addEventListener("input", updateQuickQuote);
  document.getElementById("qq-pay").addEventListener("input", updateQuickQuote);

  document.getElementById("hours").addEventListener("input", updateCustomCalculator);
  document.getElementById("pay").addEventListener("input", updateCustomCalculator);
  document.getElementById("profit").addEventListener("input", () => {
    document.getElementById("preset-profit").value = "custom";
    updateCustomCalculator();
  });
  document.getElementById("preset-profit").addEventListener("change", syncPresetProfit);

  document.getElementById("group-students").addEventListener("input", updateGroupCalculator);
  document.getElementById("group-charge").addEventListener("input", updateGroupCalculator);
  document.getElementById("group-pay").addEventListener("input", updateGroupCalculator);
  document.getElementById("group-hours").addEventListener("input", updateGroupCalculator);
}

attachListeners();
updateQuickQuote();
updateCustomCalculator();
updateGroupCalculator();
switchTab("quick");