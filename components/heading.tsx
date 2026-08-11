interface HeadingProps {
  title: string;
  description: string;
}

export const Heading: React.FC<HeadingProps> = ({ title, description }) => {
  return (
    <div>
      <h2 className="font-bold text-3xl text-stone-950 tracking-tight">
        {title}
      </h2>
      <p className="text-stone-500 text-sm">{description}</p>
    </div>
  );
};
