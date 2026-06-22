export type AgeBucket = "5-7" | "8-10" | "11-14";

export type Scenario = {
  id: string;
  sender: string;
  message: string;
  verdict: "fake" | "safe";
  why: string;
  tricky?: boolean;
  ageGroups: AgeBucket[];
};

export const AGE_BUCKETS: { id: AgeBucket; label: string; emoji: string; desc: string }[] = [
  { id: "5-7", label: "Ages 5–7", emoji: "🧸", desc: "Early readers" },
  { id: "8-10", label: "Ages 8–10", emoji: "🎮", desc: "Tweens online" },
  { id: "11-14", label: "Ages 11–14", emoji: "📱", desc: "Phones & social" },
];

export const scenarios: Scenario[] = [
  // ============ 5–7 ============
  {
    id: "b-yt-kids-button",
    sender: "YouTube Kids video",
    message:
      "A cartoon character on screen says: 'Tap the flashing red button to get a free toy unicorn!'",
    verdict: "fake",
    why: "Real toys never come from tapping a button on a video. Always ask a grown-up before you tap anything that says 'free'.",
    ageGroups: ["5-7"],
  },
  {
    id: "b-grandma-call",
    sender: "Grandma (video call)",
    message: "Grandma video-calls you on Mom's phone to say good night.",
    verdict: "safe",
    why: "It's someone you know, on a parent's phone, just saying hello. That's a normal, safe call.",
    ageGroups: ["5-7", "8-10"],
  },
  {
    id: "b-colouring-prize",
    sender: "Game on the tablet",
    message:
      "A loud pop-up in your colouring app says: 'YOU WIN! Type Mommy's phone number to get your prize! 🎁'",
    verdict: "fake",
    why: "Games never need a phone number to give a prize. If a screen asks for grown-up info, stop and tell a parent.",
    ageGroups: ["5-7", "8-10"],
  },
  {
    id: "b-stranger-school",
    sender: "Stranger online",
    message:
      "Someone you don't know in a kids' game asks: 'What school do you go to? Where do you live?'",
    verdict: "fake",
    why: "We never tell strangers where we live or which school we go to — not in real life, and not online.",
    ageGroups: ["5-7", "8-10"],
  },
  {
    id: "b-parent-drawing-app",
    sender: "Mom or Dad",
    message: "A parent sits next to you and opens your favourite drawing app for you.",
    verdict: "safe",
    why: "A trusted grown-up is right there with you. That's the safest way to use a screen.",
    ageGroups: ["5-7"],
  },
  {
    id: "b-virus-popup",
    sender: "Pop-up while playing",
    message:
      "A new window pops up: 'Your tablet has a virus! Tap here NOW to fix it!! ⚠️'",
    verdict: "fake",
    why: "Scary pop-ups try to trick you into tapping. Close the app and tell a grown-up — never tap the warning.",
    ageGroups: ["5-7", "8-10", "11-14"],
  },

  // ============ 8–10 ============
  {
    id: "b-gamezone-ipad",
    sender: "GameZone Official (YouTube)",
    message:
      "A channel you already subscribe to posts a video titled '🎁 You Won an iPad! Click to Claim Now!'",
    verdict: "fake",
    why: "Even channels you trust can get hacked. A surprise prize is still a red flag — no matter who posted it.",
    tricky: true,
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-cousin-birthday",
    sender: "Family WhatsApp group",
    message: "Your cousin posts '🎂 It's my birthday today!' in the family group.",
    verdict: "safe",
    why: "Known group, known person, nothing being asked of you. A simple, happy, safe message.",
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-roblox-trade",
    sender: "Roblox trade",
    message:
      "Another player offers to trade you a virtual hat for your virtual sword — both items swap at the same time inside the game's trade window.",
    verdict: "safe",
    why: "When both sides swap at the same moment inside the game, no one can cheat. The danger is only when someone says 'send first, I'll send mine after.'",
    tricky: true,
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-classmate-doc",
    sender: "Classmate",
    message:
      "A classmate from your school group shares a Google Doc link for your shared science project.",
    verdict: "safe",
    why: "Known classmate, expected reason, normal school tool. This is what safe online teamwork looks like.",
    tricky: true,
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-mom-new-number",
    sender: "Mom (new number?)",
    message:
      "'My phone broke, this is my new number! Quick, send me the WiFi password, I'm in a hurry!'",
    verdict: "fake",
    why: "Scammers copy how family members text. Always call Mom's old number first before trusting a sudden 'new number' message.",
    tricky: true,
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-appstore-update",
    sender: "App Store / Play Store",
    message: "Your phone's own app store shows an update is ready for a game you already have.",
    verdict: "safe",
    why: "Updates from your phone's official store are safe. That's very different from a random pop-up shouting 'Update Now!'",
    tricky: true,
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-school-portal",
    sender: "School portal",
    message: "You log into your school's website with your usual student ID to check homework.",
    verdict: "safe",
    why: "A known, official school system you already use normally — that's safe everyday online life.",
    tricky: true,
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-free-robux",
    sender: "Free Robux website",
    message:
      "A site says 'Get 10,000 FREE Robux! Just type your Roblox username and password to start.'",
    verdict: "fake",
    why: "There is no real way to get free Robux. Sites like this steal your account by asking for your password.",
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-game-100th-winner",
    sender: "Pop-up inside a game",
    message:
      "A flashy pop-up appears inside your game: 'You're our 100th winner today! Enter your gamer name and email to claim a free skin!'",
    verdict: "fake",
    why: "It can look like part of the game, but real prizes are never random pop-ups asking for your info. Close it without tapping.",
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-secret-videocall",
    sender: "New online friend",
    message:
      "Someone you just met in a game asks to video-call you privately, just the two of you, without telling your parents.",
    verdict: "fake",
    why: "Asking to keep something secret from your parents is a big red flag, even if the person seems nice. Always tell a trusted adult first.",
    ageGroups: ["8-10", "11-14"],
  },

  // ============ 11–14 ============
  {
    id: "b-insta-ambassador",
    sender: "Instagram DM from a verified-looking page",
    message:
      "'Hey! You've been selected as a brand ambassador 💖 DM us your email and address to send your free PR box.'",
    verdict: "fake",
    why: "Real brand deals don't slide into random DMs. They usually go through an email and never need your home address upfront like this.",
    ageGroups: ["11-14"],
  },
  {
    id: "b-bank-sms",
    sender: "Bank SMS",
    message:
      "'Your account will be BLOCKED in 2 hours. Verify here: bit.ly/sbi-verify-now'",
    verdict: "fake",
    why: "Banks don't shorten links or rush you. Urgency plus a strange link is a classic phishing trick — delete it.",
    ageGroups: ["11-14"],
  },
  {
    id: "b-discord-otp",
    sender: "Friend on Discord",
    message:
      "'Bro send me the OTP you just got, I tried logging into my account on your phone by mistake 🙏'",
    verdict: "fake",
    why: "OTPs are for YOU only. If someone — even a friend — needs your OTP, their account is probably hacked and they're trying to take yours too.",
    ageGroups: ["11-14"],
  },
  {
    id: "b-yt-giftcard",
    sender: "Verified-looking YouTuber",
    message:
      "'I'm doing a giveaway! Just buy a ₹500 gift card and send me the code to enter!'",
    verdict: "fake",
    why: "Real giveaways never ask you to spend money first. Gift-card codes are basically cash — anyone asking for them is scamming.",
    ageGroups: ["11-14"],
  },
  {
    id: "b-teacher-gmail",
    sender: "Teacher (personal Gmail)",
    message:
      "A message from your 'teacher' sent to your personal email asks you to resend your test answers because they 'lost the file.'",
    verdict: "fake",
    why: "Real teachers use the school email and would never urgently DM students for saved answers like this.",
    ageGroups: ["11-14"],
  },
  {
    id: "b-bestfriend-rec",
    sender: "Best friend (in person)",
    message: "Your best friend tells you face-to-face: 'You should check out this cool Minecraft channel!'",
    verdict: "safe",
    why: "A recommendation from someone you trust, in person, no link, no pressure. Totally normal.",
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-subscribe-or-deleted",
    sender: "Random Video comment",
    message: "'Subscribe RIGHT NOW or this channel gets DELETED forever!! ⚠️⚠️'",
    verdict: "fake",
    why: "Fake urgency to control your choice. Subscribing has zero effect on whether a channel exists — that's just pressure.",
    ageGroups: ["8-10", "11-14"],
  },
  {
    id: "b-gaming-buddy-supervised",
    sender: "Online gaming buddy",
    message:
      "A friend you've played with for months — who has video-called with your parent present — asks to chat on the school-supervised messaging app.",
    verdict: "safe",
    why: "A long friendship with parent involvement and a supervised app makes this safer — but it's still smart to check with a trusted adult every time.",
    tricky: true,
    ageGroups: ["11-14"],
  },
  {
    id: "b-cute-follower-selfie",
    sender: "Cute new follower",
    message:
      "Someone your age you've never met DMs: 'You're so pretty 😍 send me a selfie, just between us, don't tell anyone.'",
    verdict: "fake",
    why: "'Don't tell anyone' is the biggest red flag online. Anyone — kid or adult — asking for secret photos is unsafe. Tell a trusted adult.",
    ageGroups: ["11-14"],
  },
  {
    id: "b-school-website-hw",
    sender: "School website",
    message: "Your school posts this week's homework on its official website, same as every week.",
    verdict: "safe",
    why: "Routine, expected, from a trusted official source. Nothing surprising or pressuring here.",
    ageGroups: ["8-10", "11-14"],
  },
];
