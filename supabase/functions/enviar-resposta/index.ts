import { Resend } from "https://esm.sh/resend@3.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnviarRespostaRequest {
  manifestacaoId: string;
  destinatario: string;
  assunto: string;
  mensagem: string;
  protocolo: string;
  nomeManifestante: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { manifestacaoId, destinatario, assunto, mensagem, protocolo, nomeManifestante }: EnviarRespostaRequest = await req.json();

    console.log(`Enviando resposta para manifestação ${protocolo}`);

    // Enviar email via Resend
    const emailResponse = await resend.emails.send({
      from: "Ouvidoria <onboarding@resend.dev>",
      to: [destinatario],
      subject: assunto,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Resposta da Ouvidoria
          </h2>
          
          <p>Prezado(a) <strong>${nomeManifestante}</strong>,</p>
          
          <p>Em atenção à sua manifestação de protocolo <strong>${protocolo}</strong>, informamos:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${mensagem.replace(/\n/g, '<br>')}
          </div>
          
          <p style="margin-top: 30px;">
            Agradecemos por entrar em contato conosco e colocamo-nos à disposição para quaisquer esclarecimentos.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px;">
            Esta é uma mensagem automática. Para acompanhar sua manifestação, use o protocolo <strong>${protocolo}</strong>.
          </p>
        </div>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    // Registrar comunicação no banco
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar ID do usuário que está respondendo
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    let usuarioId = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("id")
          .eq("auth_id", user.id)
          .single();
        
        usuarioId = usuario?.id;
      }
    }

    await supabase.from("comunicacoes").insert({
      manifestacao_id: manifestacaoId,
      tipo: "EMAIL",
      destinatario,
      remetente: "Ouvidoria",
      assunto,
      mensagem,
      interno: false,
      usuario_id: usuarioId,
      email_status: "ENVIADO",
      email_id: emailResponse.data?.id,
    });

    console.log("Comunicação registrada no banco");

    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar resposta:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
