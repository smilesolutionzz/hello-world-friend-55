import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fmt = (n: number) => "₩" + n.toLocaleString("ko-KR");

async function makePdf(opts: {
  title: string;
  docNo: string;
  company: string;
  contact: string;
  email: string;
  planName: string;
  employees: number;
  months: number;
  unitPrice: number;
  subtotal: number;
  vat: number;
  total: number;
  validUntil?: string;
  dueDate?: string;
  notes?: string;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const gold = rgb(0.78, 0.72, 0.54);
  const dark = rgb(0.1, 0.1, 0.12);
  const grey = rgb(0.45, 0.45, 0.5);

  const draw = (txt: string, x: number, y: number, size = 10, f = font, c = dark) => {
    page.drawText(txt, { x, y, size, font: f, color: c });
  };

  // Header
  page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: rgb(0.06, 0.06, 0.08) });
  draw("AIHPRO", 40, 810, 18, bold, rgb(1, 1, 1));
  draw("Workplace Mental Health Platform", 40, 798, 8, font, gold);
  draw(opts.title.toUpperCase(), 555 - opts.title.length * 6, 810, 14, bold, rgb(1, 1, 1));

  // Doc info
  draw("Document No.", 40, 760, 8, font, grey);
  draw(opts.docNo, 40, 748, 11, bold);
  draw(opts.validUntil ? "Valid Until" : "Due Date", 200, 760, 8, font, grey);
  draw(opts.validUntil || opts.dueDate || "-", 200, 748, 11, bold);

  // Customer
  draw("BILL TO", 40, 710, 8, bold, gold);
  draw(opts.company, 40, 692, 13, bold);
  draw(`${opts.contact}  ·  ${opts.email}`, 40, 676, 9, font, grey);

  // Table header
  let y = 630;
  page.drawLine({ start: { x: 40, y: y + 18 }, end: { x: 555, y: y + 18 }, color: dark, thickness: 1 });
  draw("ITEM", 40, y + 4, 8, bold, grey);
  draw("EMPLOYEES", 280, y + 4, 8, bold, grey);
  draw("MONTHS", 360, y + 4, 8, bold, grey);
  draw("UNIT", 420, y + 4, 8, bold, grey);
  draw("AMOUNT", 510, y + 4, 8, bold, grey);
  page.drawLine({ start: { x: 40, y: y - 6 }, end: { x: 555, y: y - 6 }, color: grey, thickness: 0.5 });

  y -= 28;
  draw(opts.planName, 40, y, 11, bold);
  draw(String(opts.employees), 280, y, 11);
  draw(String(opts.months), 360, y, 11);
  draw(fmt(opts.unitPrice), 420, y, 11);
  draw(fmt(opts.subtotal), 510, y, 11);

  // Totals
  y -= 50;
  draw("Subtotal", 420, y, 9, font, grey);
  draw(fmt(opts.subtotal), 510, y, 10);
  y -= 16;
  draw("VAT (10%)", 420, y, 9, font, grey);
  draw(fmt(opts.vat), 510, y, 10);
  y -= 18;
  page.drawLine({ start: { x: 420, y: y + 12 }, end: { x: 555, y: y + 12 }, color: dark, thickness: 1 });
  draw("TOTAL", 420, y - 4, 11, bold);
  draw(fmt(opts.total), 510, y - 4, 13, bold, gold);

  // Notes
  if (opts.notes) {
    draw("NOTES", 40, 280, 8, bold, gold);
    const lines = opts.notes.match(/.{1,80}/g) || [];
    lines.forEach((l, i) => draw(l, 40, 264 - i * 14, 9, font, dark));
  }

  // Footer
  draw("AIHPRO  ·  aihpro.app  ·  contact@aihpro.app", 40, 40, 8, font, grey);
  draw("This document is computer-generated and does not require a signature.", 40, 28, 7, font, grey);

  return await pdf.save();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { mode, ...input } = body; // mode = 'quote' | 'invoice'

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (mode === "quote") {
      const { plan_key, employee_count, months = 12, company_name, contact_name, contact_email, inquiry_id, notes } = input;

      // 가격 조회
      const { data: plan, error: planErr } = await supabase
        .from("b2b_jobcoach_plans")
        .select("plan_name, price_per_employee_monthly")
        .eq("plan_key", plan_key)
        .single();
      if (planErr || !plan) throw new Error("plan_not_found");

      const unit = plan.price_per_employee_monthly;
      const subtotal = unit * employee_count * months;
      const vat = Math.round(subtotal * 0.1);
      const total = subtotal + vat;

      const { data: quote, error: qErr } = await supabase
        .from("b2b_quotes")
        .insert({
          inquiry_id,
          company_name, contact_name, contact_email,
          plan_key, plan_name: plan.plan_name,
          employee_count, months,
          unit_price: unit, subtotal, vat, total,
          status: "draft",
          notes,
        })
        .select()
        .single();
      if (qErr) throw qErr;

      const pdfBytes = await makePdf({
        title: "Quotation",
        docNo: quote.quote_no,
        company: company_name,
        contact: contact_name || "",
        email: contact_email,
        planName: plan.plan_name,
        employees: employee_count,
        months,
        unitPrice: unit,
        subtotal, vat, total,
        validUntil: quote.valid_until,
        notes,
      });

      const path = `${quote.id}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("b2b-quotes")
        .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
      if (upErr) throw upErr;

      const { data: signed } = await supabase.storage
        .from("b2b-quotes")
        .createSignedUrl(path, 60 * 60 * 24 * 30);

      await supabase
        .from("b2b_quotes")
        .update({ pdf_url: signed?.signedUrl, status: "sent" })
        .eq("id", quote.id);

      return new Response(JSON.stringify({ ok: true, quote_id: quote.id, pdf_url: signed?.signedUrl, quote_no: quote.quote_no, total }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "invoice") {
      const { quote_id } = input;
      const { data: quote, error: qErr } = await supabase
        .from("b2b_quotes").select("*").eq("id", quote_id).single();
      if (qErr || !quote) throw new Error("quote_not_found");

      const { data: invoice, error: iErr } = await supabase
        .from("b2b_invoices")
        .insert({
          quote_id: quote.id,
          company_name: quote.company_name,
          contact_email: quote.contact_email,
          billing_period_start: new Date().toISOString().slice(0, 10),
          billing_period_end: new Date(Date.now() + quote.months * 30 * 86400 * 1000).toISOString().slice(0, 10),
          amount: quote.subtotal,
          vat: quote.vat,
          total: quote.total,
        })
        .select()
        .single();
      if (iErr) throw iErr;

      const pdfBytes = await makePdf({
        title: "Invoice",
        docNo: invoice.invoice_no,
        company: quote.company_name,
        contact: quote.contact_name || "",
        email: quote.contact_email,
        planName: quote.plan_name,
        employees: quote.employee_count,
        months: quote.months,
        unitPrice: quote.unit_price,
        subtotal: quote.subtotal,
        vat: quote.vat,
        total: quote.total,
        dueDate: invoice.due_date,
      });

      const path = `invoice-${invoice.id}.pdf`;
      await supabase.storage.from("b2b-quotes").upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
      const { data: signed } = await supabase.storage.from("b2b-quotes").createSignedUrl(path, 60 * 60 * 24 * 90);

      await supabase.from("b2b_invoices").update({ pdf_url: signed?.signedUrl }).eq("id", invoice.id);
      await supabase.from("b2b_quotes").update({ status: "accepted" }).eq("id", quote.id);

      // 인보이스 메일
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "b2b-invoice-issued",
            recipientEmail: quote.contact_email,
            idempotencyKey: `invoice-${invoice.id}`,
            templateData: {
              contactName: quote.contact_name,
              company: quote.company_name,
              invoiceNo: invoice.invoice_no,
              total: invoice.total,
              dueDate: invoice.due_date,
              pdfUrl: signed?.signedUrl,
            },
          },
        });
      } catch (e) {
        console.warn("[invoice email]", e);
      }

      return new Response(JSON.stringify({ ok: true, invoice_id: invoice.id, pdf_url: signed?.signedUrl, invoice_no: invoice.invoice_no }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "invalid mode" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[generate-b2b-document]", e);
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
