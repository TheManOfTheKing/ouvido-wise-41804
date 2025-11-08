import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold">Ouvidoria</h1>
          </Link>
          <Link to="/login">
            <Button variant="outline">Acesso Restrito</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6"
          asChild
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Portal
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-6 text-center">Política de Privacidade</h1>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p>
            A sua privacidade é importante para nós. É política do Sistema de Ouvidoria respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Sistema de Ouvidoria, e outros sites que possuímos e operamos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Coleta de Informações Pessoais</h2>
          <p>
            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
          </p>
          <p>
            As informações coletadas podem incluir:
            <ul className="list-disc list-inside ml-4">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Número de telefone</li>
              <li>CPF (opcional)</li>
              <li>Endereço (opcional)</li>
            </ul>
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Uso das Informações</h2>
          <p>
            As informações coletadas são usadas para:
            <ul className="list-disc list-inside ml-4">
              <li>Processar e acompanhar suas manifestações (elogios, sugestões, reclamações, denúncias, solicitações).</li>
              <li>Comunicar o status de suas manifestações.</li>
              <li>Melhorar nossos serviços e a experiência do usuário.</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </p>
          <p>
            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Segurança dos Dados</h2>
          <p>
            Mantemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Seus Direitos (LGPD)</h2>
          <p>
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:
            <ul className="list-disc list-inside ml-4">
              <li>Acessar seus dados pessoais.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
            </ul>
            Para exercer esses direitos, entre em contato conosco através dos canais oficiais da Ouvidoria.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Compromisso do Usuário</h2>
          <p>
            O usuário compromete-se a fazer uso adequado dos conteúdos e da informação que o Sistema de Ouvidoria oferece no site e com caráter enunciativo, mas não limitativo:
            <ul className="list-disc list-inside ml-4">
              <li>Não se envolver em atividades que sejam ilegais ou contrárias à boa fé e à ordem pública;</li>
              <li>Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, casas de apostas, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
              <li>Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do Sistema de Ouvidoria, de seus fornecedores ou de terceiros, para introduzir ou disseminar vírus informáticos ou quaisquer outros sistemas de hardware ou software que sejam capazes de causar danos anteriormente mencionados.</li>
            </ul>
          </p>

          <p className="mt-8">
            Esta política é efetiva a partir de <strong>08 de Novembro de 2025</strong>.
          </p>
        </div>
      </div>

      <footer className="border-t mt-16 py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Sistema de Ouvidoria - Gestão Transparente e Eficiente</p>
          <p className="mt-2">Seus dados estão protegidos conforme a LGPD</p>
        </div>
      </footer>
    </div>
  );
}