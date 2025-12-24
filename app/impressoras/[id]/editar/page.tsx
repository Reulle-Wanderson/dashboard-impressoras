import OnlyLocal from "@/components/OnlyLocal";
import EditarImpressoraConteudo from "./EditarImpressoraConteudo";

interface Props {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: Props) {
  return (
    <OnlyLocal>
      <EditarImpressoraConteudo params={params} />
    </OnlyLocal>
  );
}
