import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-session";
import { db } from "@/utils/turso";

const PRODUCT_WITH_CATEGORY_SQL = `
  SELECT p.id, p.name, p.desc, p.image_url, p.link, p.category_id, p.created_at,
         p.price, p.currency, p.location, p.sde, p.down_payment,
         c.id as cat_id, c.label as cat_label, c.desc as cat_desc
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
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

export const GET = async (_req: Request, _res: Response) => {
  try {
    const result = await db.execute(
      `${PRODUCT_WITH_CATEGORY_SQL} ORDER BY p.created_at DESC`,
    );

    const products = result.rows.map((row) =>
      mapRow(row as Record<string, unknown>),
    );

    return NextResponse.json(products, { status: 200 });
  } catch (_err) {
    return new NextResponse("Server Error", { status: 500 });
  }
};

export const POST = async (req: Request, _res: Response) => {
  const { response: unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const {
    name,
    desc,
    imageUrl,
    link,
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

  if (!category) {
    return new NextResponse("Please add the product to a category", {
      status: 400,
    });
  }

  try {
    const id = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO products (id, name, desc, image_url, link, category_id, price, currency, location, sde, down_payment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        id,
        name,
        desc,
        imageUrl,
        link || "",
        category,
        price ?? null,
        currency || "USD",
        location ?? null,
        sde ?? null,
        downPayment ?? null,
      ],
    });

    const result = await db.execute({
      sql: `${PRODUCT_WITH_CATEGORY_SQL} WHERE p.id = ?`,
      args: [id],
    });

    return NextResponse.json(
      mapRow(result.rows[0] as Record<string, unknown>),
      { status: 200 },
    );
  } catch (error) {
    console.log("[PRODUCT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
