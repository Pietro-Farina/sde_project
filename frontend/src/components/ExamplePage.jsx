export default function ExamplePage() {
  return (
    <div>
      <h2>Scrollable content</h2>

      {/* Simulate long content */}
      {Array.from({ length: 100 }).map((_, i) => (
        <p key={i}>Row {i + 1}</p>
      ))}
    </div>
  );
}
