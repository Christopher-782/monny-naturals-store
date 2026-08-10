import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

export default function NotFound() {
  const { store } = useContent();
  return <section className="page-shell container empty-state not-found"><span>404</span><h1>This page wandered into the garden.</h1><p>Let’s get you back to the {store.brandName} collection.</p><Link className="btn btn-dark" to="/">Return home</Link></section>;
}
