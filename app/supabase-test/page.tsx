import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Supabase Todos Test</h1>
      <ul className="list-disc pl-5">
        {todos?.map((todo: any) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
        {!todos?.length && <p className="text-gray-500">No todos found or connection pending.</p>}
      </ul>
    </div>
  )
}
