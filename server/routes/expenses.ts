import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";


const expenseSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(100),
    amount: z.number().int().positive(),
});

type Expense = z.infer<typeof expenseSchema>;

const createPostSchema = expenseSchema.omit({ id: true });

const fake: Expense[] = [
    { id: 1, name: "food", amount: 100 },
    { id: 2, name: "rent", amount: 200 },
    { id: 3, name: "groceries", amount: 300 },
    { id: 4, name: "entertainment", amount: 400 },
    { id: 5, name: "transportation", amount: 500 },
];

export const expensesRoute = new Hono()
    .get("/", async (c) => {
        return c.json({ fake });
    })
    .post("/", zValidator("json", createPostSchema), async (c) => {
        const expense = await c.req.valid("json");
        fake.push({...expense, id: fake.length + 1});
        c.status(201);
        return c.json(expense);
    })
    .get("/:id{[0-9]+}", (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const expense = fake.find((expense) => expense.id === id);
        console.log(expense);
        
        if (!expense) {
            return c.notFound();
        }
        return c.json({ expense});
    })
    .delete("/:id{[0-9]+}", (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const index = fake.findIndex((expense) => expense.id === id);

        if(index === -1) {
            return c.notFound();
        }

       const deletedExpense = fake.splice(index, 1)[0];
       return c.json({ expense: deletedExpense }); 
    })