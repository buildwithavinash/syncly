
const Header = () => {
  return (
    <header className="flex justify-between px-4 py-2">

        {/* left */}
        <a href="#" className="text-slate-900">Syncly</a>

        {/* right */}
        <div className="flex gap-4">
            <a>Login</a>
            <a>Get Started</a>
        </div>
    </header>
  )
}

export default Header