const LOGO_URL =
  'https://res.cloudinary.com/da4dwb3te/image/upload/v1793771938/20261104_112703_htuh5x.png';

export default function SiteLogo({ className = '' }) {
  return (
    <img
      src={LOGO_URL}
      alt=""
      aria-hidden="true"
      className={`h-10 w-10 shrink-0 rounded-md object-contain ${className}`}
    />
  );
}
