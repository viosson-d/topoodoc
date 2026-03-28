type DocsBrandProps = {
  label?: string;
};

export function DocsBrand({ label = "Docs" }: DocsBrandProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-flex size-5 items-center justify-center text-[15px] font-semibold leading-none"
      >
        /
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
