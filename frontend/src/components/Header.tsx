import { useLocation } from 'preact-iso';
import "./Header.css"

export function Header() {
  const { url } = useLocation();

  return (
    <header className="header">
        <input type="search" name="file-search" id="input-file-search"/>
        {/*<a href="/" class={url == '/' && 'active'}>*/}
        {/*  Home*/}
        {/*</a>*/}
        {/*<a href="/404" class={url == '/404' && 'active'}>*/}
        {/*  404*/}
        {/*</a>*/}
    </header>
  );
}
