import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(request: Request): Promise<Response> {
  try {
    const { ip } = await request.json();

    if (!ip) {
      return NextResponse.json(
        { success: false, error: "IP não informado" },
        { status: 400 }
      );
    }

    const ipRegex =
      /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

    if (!ipRegex.test(ip)) {
      return NextResponse.json(
        { success: false, error: "IP inválido" },
        { status: 400 }
      );
    }

    const comando = `python src/teste_snmp.py ${ip}`;

    return await new Promise((resolve) => {
      exec(comando, (error, stdout) => {
        if (error) {
          resolve(
            NextResponse.json({
              success: false,
              error: "Falha ao executar teste SNMP",
            })
          );
          return;
        }

        try {
          const resultado = JSON.parse(stdout.trim());
          resolve(NextResponse.json(resultado));
        } catch {
          resolve(
            NextResponse.json({
              success: false,
              error: "Retorno SNMP inválido",
            })
          );
        }
      });
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
