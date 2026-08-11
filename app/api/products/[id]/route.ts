import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-session";
import { db } from "@/utils/turso";

const PRODUCT_WITH_CATEGORY_SQL = `
  SELECT p.id, p.name, p.desc, p.image_url, p.link, p.category_id, p.created_at,
         p.price, p.currency, p.location, p.sde, p.down_payment,
         c.id as cat_id, c.label as cat_label, c.desc as cat_desc
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.id = ?
`;

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    desc: row.desc,
    imageUrl: row.image_url,
    link: row.link,
    created_at: row.created_at,
    price: row.price,
    currency: row.currency,
    location: row.location,
    sde: row.sde,
    downPayment: row.down_payment,
    category: row.cat_id
      ? { id: row.cat_id, label: row.cat_label, desc: row.cat_desc }
      : null,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  if (!id) {
    return new NextResponse("product id is required", { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: PRODUCT_WITH_CATEGORY_SQL,
      args: [id],
    });

    if (result.rows.length === 0) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return NextResponse.json(
      mapRow(result.rows[0] as Record<string, unknown>),
      { status: 200 },
    );
  } catch (_err) {
    return new NextResponse("Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { response: unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const { id } = params;

  if (!id) {
    return new NextResponse("product id is required", { status: 400 });
  }

  const {
    name,
    link,
    desc,
    imageUrl,
    category,
    price,
    currency,
    location,
    sde,
    downPayment,
  } = await req.json();

  if (!name) {
    return new NextResponse("Please enter product name", { status: 400 });
  }

  if (!desc) {
    return new NextResponse("Please enter description", { status: 400 });
  }

  if (!imageUrl) {
    return new NextResponse("Please add an image", { status: 400 });
  }

  try {
    await db.execute({
      sql: "UPDATE products SET name = ?, desc = ?, image_url = ?, link = ?, category_id = ?, price = ?, currency = ?, location = ?, sde = ?, down_payment = ? WHERE id = ?",
      args: [
        name,
        desc,
        imageUrl,
        link || "",
        category ?? null,
        price ?? null,
        currency || "USD",
        location ?? null,
        sde ?? null,
        downPayment ?? null,
        id,
      ],
    });

    const result = await db.execute({
      sql: PRODUCT_WITH_CATEGORY_SQL,
      args: [id],
    });

    return NextResponse.json(mapRow(result.rows[0] as Record<string, unknown>));
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { response: unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const { id } = params;

  if (!id) {
    return new NextResponse("product id is required", { status: 400 });
  }

  try {
    await db.execute({
      sql: "DELETE FROM products WHERE id = ?",
      args: [id],
    });

    return new NextResponse("Product has been deleted", { status: 200 });
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
