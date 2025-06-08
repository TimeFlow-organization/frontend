import { Link } from 'react-router-dom';
import Logo from '../assets/Logo';

export default function AppBrand() {
  return (
    <Link to="/" className="d-flex align-items-center text-decoration-none">
      <Logo style={{ marginRight: 8 }} />
      <span className="fs-4 fw-bold">TimeFlow</span>
    </Link>
  );
}