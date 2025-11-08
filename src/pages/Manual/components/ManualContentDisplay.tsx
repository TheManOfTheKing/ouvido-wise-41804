import { useParams } from "react-router-dom";
import { manualSections } from "../data/manualContent";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function ManualContentDisplay() {
  const { topicPath } = useParams<{ topicPath: string }>();

  const currentTopic = manualSections
    .flatMap((section) => section.topics)
    .find((topic) => topic.path === topicPath);

  if (!currentTopic) {
    return (
      <Card className="h-full flex items-center justify-center p-6">
        <Alert className="max-w-md">
          <Info className="h-4 w-4" />
          <AlertTitle>Tópico não encontrado</AlertTitle>
          <AlertDescription>
            O tópico do manual que você está procurando não existe ou foi removido.
            Por favor, selecione um tópico válido na barra lateral.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-y-auto p-6">
      <CardContent className="prose dark:prose-invert max-w-none">
        {/* Renderiza o HTML diretamente. Cuidado com XSS se o conteúdo vier de fontes não confiáveis. */}
        <div dangerouslySetInnerHTML={{ __html: currentTopic.content }} />
      </CardContent>
    </Card>
  );
}