// Sample message bank with expected answers and explanation
const MESSAGES = [
  {
    id: 1,
    sender: "security@yourbank-alerts.com",
    subject: "URGENT: Verify your account to avoid suspension",
    date: "Today",
    body: `Dear customer — We detected suspicious activity on your account. Please verify immediately or your account will be suspended. <a href="http://example.com/verify?user=123" class="demo-link">http://example.com/verify?user=123</a>`,
    links: ["http://example.com/verify?user=123"],
    answer: {phishing: true, suspiciousLink: true, scam: false},
    explanation: "Impersonates a bank, creates urgency, and asks you to click a link to verify. Look for mismatched sender domains and urgent threats to trick you into acting quickly."
  },
  {
    id: 2,
    sender: "noreply@social.example.com",
    subject: "New login detected on your account",
    date: "Yesterday",
    body: `We noticed a login from a new device. If this wasn't you, change your password here: <a href="https://example.com/account-security" class="demo-link">example.com/account-security</a>`,
    links: ["https://example.com/account-security"],
    answer: {phishing: false, suspiciousLink: false, scam: false},
    explanation: "This is a plausible security notification. However, always check the sender domain and where the link actually points before clicking. In this training copy it's benign."
  },
  {
    id: 3,
    sender: "it-support@company-it.com",
    subject: "Install this remote tool now",
    date: "2 days ago",
    body: `We urgently need you to install a remote support agent. Download from <a href="http://bit.ly/fakerd-support" class="demo-link">http://bit.ly/fakerd-support</a> and run it.`,
    links: ["http://bit.ly/fakerd-support"],
    answer: {phishing: false, suspiciousLink: true, scam: true},
    explanation: "Unexpected requests to install remote-access software are high-risk — they can be used to takeover systems. Shortened links are suspicious because you can't see the real destination."
  },
  {
    id: 4,
    sender: "promo@contest.example",
    subject: "Congratulations! You won $5,000 USD",
    date: "Last week",
    body: `You've been selected to win. Click here <a href="http://example.com/claim-prize" class="demo-link">claim your prize</a> and enter your details to receive payment.`,
    links: ["http://example.com/claim-prize"],
    answer: {phishing: false, suspiciousLink: true, scam: true},
    explanation: "Unexpected prize notifications that ask for personal or payment info are classic scams. Legit contests do not ask you to provide sensitive data upfront via a link."
  },
  {
    id: 5,
    sender: "friend@example.org",
    subject: "Check out this article",
    date: "A few hours ago",
    body: `Hey, thought you'd like this read: <a href="https://example.com/blog/great-read" class="demo-link">example.com/blog/great-read</a> — looks interesting.`,
    links: ["https://example.com/blog/great-read"],
    answer: {phishing: false, suspiciousLink: false, scam: false},
    explanation: "A normal message from a contact. Still, confirm unexpected attachments/links, and if the message is unusual, contact the sender by another channel to verify."
  }
];

const messagesEl = document.getElementById("messages");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const resultsEl = document.getElementById("results");

function buildMessageCard(msg) {
  const card = document.createElement("article");
  card.className = "message-card";
  card.id = `msg-${msg.id}`;

  card.innerHTML = `
    <div class="meta"><strong>${escapeHtml(msg.sender)}</strong>
      <span class="small">· ${escapeHtml(msg.subject)} · ${escapeHtml(msg.date)}</span>
    </div>
    <div class="body">${msg.body}</div>
    <div class="controls" aria-label="Answer options for message ${msg.id}">
      <label class="control"><input type="checkbox" data-id="${msg.id}" data-field="phishing"> Phishing</label>
      <label class="control"><input type="checkbox" data-id="${msg.id}" data-field="suspiciousLink"> Suspicious link</label>
      <label class="control"><input type="checkbox" data-id="${msg.id}" data-field="scam"> Online scam</label>
      <span class="hint small">Tip: Hover or click links to inspect URL and sender.</span>
    </div>
    <div class="feedback hidden" id="feedback-${msg.id}"></div>
  `;

  // Prevent example links from navigating; show details on click
  Array.from(card.querySelectorAll(".demo-link")).forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      showLinkPreview(msg, a.href);
    });
    a.addEventListener("mouseover", e => {
      a.title = a.href; // reveal full href on hover (simulates "inspect link")
    });
  });

  return card;
}

function renderMessages() {
  messagesEl.innerHTML = "";
  MESSAGES.forEach(m => messagesEl.appendChild(buildMessageCard(m)));
}

function getUserAnswers() {
  const answers = {};
  document.querySelectorAll('.message-card').forEach(card => {
    const id = Number(card.id.replace("msg-", ""));
    answers[id] = {phishing: false, suspiciousLink: false, scam: false};
    card.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const field = cb.dataset.field;
      if (cb.checked) answers[id][field] = true;
    });
  });
  return answers;
}

function evaluate() {
  const user = getUserAnswers();
  let correctCount = 0;
  let totalItems = 0;

  resultsEl.innerHTML = "";
  resultsEl.classList.remove("hidden");

  MESSAGES.forEach(msg => {
    const fb = document.getElementById(`feedback-${msg.id}`);
    fb.className = "feedback hidden";
    const userAns = user[msg.id] || {};
    const expected = msg.answer;

    // For scoring, compare each of the three fields (3 per message)
    const fields = ["phishing", "suspiciousLink", "scam"];
    let cardCorrect = true;
    const fieldResults = [];

    fields.forEach(f => {
      totalItems++;
      const isCorrect = !!userAns[f] === !!expected[f];
      if (isCorrect) correctCount++;
      else cardCorrect = false;
      fieldResults.push({field: f, correct: isCorrect, selected: !!userAns[f], expected: !!expected[f]});
    });

    // Build feedback content
    fb.innerHTML = `
      <div class="${cardCorrect ? "correct" : "incorrect"}">
        <strong>${cardCorrect ? "Good job!" : "Review this message carefully"}</strong>
        <div class="small">You marked: ${fields.map(f => (userAns[f] ? f : null)).filter(Boolean).join(", ") || "Nothing"}</div>
        <div class="explanation"><strong>Why:</strong> ${escapeHtml(msg.explanation)}</div>
        <div class="small" style="margin-top:8px"><strong>Answer key:</strong> ${fields.map(f => `${f}: ${expected[f] ? "Yes" : "No"}`).join(" · ")}</div>
      </div>
    `;
    fb.classList.remove("hidden");
  });

  const percent = Math.round((correctCount / totalItems) * 100);
  resultsEl.innerHTML = `<h3>Results: ${percent}% (${correctCount}/${totalItems} correct)</h3>
    <p class="small">Review individual feedback below each message. Use this to learn how to spot social engineering and suspicious links.</p>`;
  // scroll to results
  resultsEl.scrollIntoView({behavior: "smooth"});
}

function reset() {
  document.querySelectorAll('.message-card input[type="checkbox"]').forEach(cb => cb.checked = false);
  resultsEl.classList.add("hidden");
  document.querySelectorAll('.feedback').forEach(fb => fb.classList.add("hidden"));
}

function showLinkPreview(msg, href) {
  // Simple preview modal using alert (keeps example self-contained).
  // Show reasons why link might be suspicious
  const isShort = href.includes("bit.ly") || href.includes("tinyurl") || href.includes("t.co");
  const reasons = [];
  if (isShort) reasons.push("Shortened links hide the real destination.");
  if (!href.startsWith("https://")) reasons.push("Not using HTTPS — data could be intercepted.");
  if (msg.sender && !sameBaseDomain(msg.sender, href)) reasons.push("Sender domain and link domain don't match.");
  const note = reasons.length ? ("\n\nSuspicion notes:\n- " + reasons.join("\n- ")) : "\n\nNo immediate red flags detected for this sample link.";
  alert(`Link preview:\n${href}${note}`);
}

function sameBaseDomain(sender, href) {
  try {
    // get domain from sender email (after @) and domain from url
    const at = sender.split("@")[1] || "";
    const url = new URL(href);
    return url.hostname.endsWith(at);
  } catch (e) {
    return false;
  }
}

// Basic sanitizer for small content pieces we control
function escapeHtml(unsafe) {
  return (unsafe + "").replace(/[&<>"']/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]);
  });
}

submitBtn.addEventListener("click", evaluate);
resetBtn.addEventListener("click", reset);

// initial render
renderMessages();