export function Hero() {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-center">
      <h1 className="text-[10px] italic">✨ Supercharge your workflow</h1>
      <h4>Oops</h4>
      <img src="/a.png" />
      <button className="rounded-full outline-none"><Icon /></button>
      <div onClick={() => go()}>Go</div>
    </div>
  );
}
