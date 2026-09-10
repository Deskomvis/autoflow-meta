const waPhone = '6285741813147';
const waMessage =
  'Mas rezha, saya mau tanya Methode Autoflow Meta Ads di MCP Claude Ai';
const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;

export default function WhatsappBubble() {
  return (
    <a
      className="wa-bubble"
      href={waUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat WhatsApp dengan Mas Rezha"
    >
      <span className="wa-bubble-label" aria-hidden="true">
        <strong>Tanya Mas Rezha</strong>
        <span>Balas cepat via WhatsApp</span>
      </span>
      <span className="wa-bubble-figure">
        <img
          className="wa-bubble-avatar"
          src="/images/gus-rezha-cozy.jpg"
          alt=""
          width={56}
          height={56}
          loading="lazy"
        />
        <svg className="wa-bubble-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.63 15.06L2 22l5.06-1.33A10 10 0 1 0 12 2Zm0 18.06a8 8 0 0 1-4.08-1.12l-.29-.17-3 .79.8-2.93-.19-.3A8 8 0 1 1 12 20.06Zm4.6-5.99c-.25-.13-1.49-.74-1.72-.82-.23-.09-.4-.13-.57.12-.17.25-.65.82-.8.99-.15.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.37-.78-1.87-.2-.49-.41-.42-.57-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.49-.61 1.7-1.2.21-.59.21-1.1.15-1.2-.06-.11-.23-.17-.48-.3Z" />
        </svg>
      </span>
    </a>
  );
}
