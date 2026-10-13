import { Link, type Href } from "expo-router";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: Href & string;
};
export function ExternalLink({ href, ...props }: Props) {
  return <Link href={href} target="_blank" {...props} />;
}
