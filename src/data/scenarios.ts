export type Scenario = {
  sender: string;
  message: string;
  verdict: "fake" | "safe";
  why: string;
  tricky?: boolean;
};

export const scenarios: Scenario[] = [
  {
    sender: "GameZone Official",
    message:
      "A channel you already subscribe to posts a video titled '🎁 You Won an iPad! Click to Claim Now!'",
    verdict: "fake",
    why: "Even channels you trust can get hacked or tricked into posting scams. A surprise prize claim is still a red flag — no matter who posted it.",
    tricky: true,
  },
  {
    sender: "Family Group Chat",
    message:
      "Your cousin posts '🎂 It's my birthday today!' in the family WhatsApp group.",
    verdict: "safe",
    why: "Known group, known person, nothing being asked of you. A simple, happy, safe message.",
  },
  {
    sender: "Verified YouTuber",
    message:
      "'I'm doing a giveaway! Just buy a ₹500 gift card and send me the code to enter!'",
    verdict: "fake",
    why: "Real giveaways never ask YOU to spend money first. Even a 'verified'-looking account asking for gift card codes is always a scam.",
  },
  {
    sender: "Classmate",
    message:
      "A classmate from your school group shares a Google Doc link for your shared science project.",
    verdict: "safe",
    why: "Known classmate, expected reason, normal school tool. This is exactly how safe online teamwork looks.",
    tricky: true,
  },
  {
    sender: "Mom (new number?)",
    message:
      "'My phone broke, this is my new number! Quick, send me the WiFi password, I'm in a hurry!'",
    verdict: "fake",
    why: "Scammers copy how family members text. Always double-check on a call to the OLD number before trusting an urgent new-number message.",
    tricky: true,
  },
  {
    sender: "App Store",
    message:
      "Your phone's own App Store shows an update is ready for a game you already have.",
    verdict: "safe",
    why: "Updates from your phone's official store are safe. That's very different from a random pop-up shouting 'Update Now!'",
    tricky: true,
  },
  {
    sender: "Teacher (personal email)",
    message:
      "A message from your 'teacher', sent to your personal email, asks you to resend your test answers because they 'lost the file.'",
    verdict: "fake",
    why: "Real teachers use the official school email and would never urgently need a student's saved answers like this.",
  },
  {
    sender: "Best Friend (in person)",
    message:
      "Your best friend tells you in person: 'You should check out this cool Minecraft build channel!'",
    verdict: "safe",
    why: "A recommendation from someone you trust, face-to-face, no link, no pressure. Totally normal.",
  },
  {
    sender: "Roblox Player",
    message:
      "A player offers to trade you a virtual hat for your virtual sword — both items get swapped at the same time, no money, no personal info.",
    verdict: "safe",
    why: "This is actually safe — no money or personal details involved, and both sides trade at once. The danger is only when someone asks you to 'send first' and trust them.",
    tricky: true,
  },
  {
    sender: "Random Video",
    message:
      "'Subscribe RIGHT NOW or this channel gets DELETED forever!! ⚠️⚠️'",
    verdict: "fake",
    why: "Fake urgency to control your choice. Subscribing or not has zero effect on whether a channel exists — that's just pressure.",
  },
  {
    sender: "School Portal",
    message:
      "You log into your school's official website using your usual student ID to check your test schedule.",
    verdict: "safe",
    why: "A known, official school system you already use normally — that's safe daily life online.",
    tricky: true,
  },
  {
    sender: "Free Rewards Site",
    message:
      "A website promises 'free game coins' if you complete 3 quick surveys first to 'unlock' it.",
    verdict: "fake",
    why: "There's no real way to generate free in-game currency. These sites just collect your personal info through the 'surveys.'",
  },
  {
    sender: "Online Gaming Buddy",
    message:
      "A friend you've played with for months, who has video-called with your parent present, asks to chat on the school-supervised messaging app.",
    verdict: "safe",
    why: "A long friendship with parent involvement and a supervised app makes this safer — but it's still smart to always check with a trusted adult first, every time.",
    tricky: true,
  },
  {
    sender: "Pop-up Inside Game",
    message:
      "A flashy pop-up appears INSIDE your game: 'You're our 100th winner today! Enter your gamer name and email to claim a free skin!'",
    verdict: "fake",
    why: "It can look like it's part of the game, but real prizes are never random pop-ups asking for your info. Close it without tapping.",
  },
  {
    sender: "School Website",
    message:
      "Your school posts this week's homework on its official website, same as every week.",
    verdict: "safe",
    why: "Routine, expected, from a trusted official source. Nothing surprising or pressuring here.",
  },
  {
    sender: "New Online Friend",
    message:
      "Someone you just met in a game asks to video call you privately, just the two of you, without telling your parents.",
    verdict: "fake",
    why: "Asking to keep something secret from your parents is a major red flag, even if the person seems nice. Always loop in a trusted adult before any private video call.",
  },
];
