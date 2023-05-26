import clsx from "clsx";
import { ExternalLinkIcon } from "lucide-react";
import { type HTMLAttributes, type ReactNode } from "react";

export type ExternalLinkProps = Pick<
  HTMLAttributes<"a">,
  "className" | "title"
> & {
  href: string;
  children: ReactNode;
};

export const ExternalLink = ({
  href,
  children,
  className,
  title,
}: ExternalLinkProps): JSX.Element => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx("inline-flex items-center hover:underline", className)}
      title={title}
    >
      {children}
      <ExternalLinkIcon className="my-auto ml-1 h-5 w-5" />
    </a>
  );
};
