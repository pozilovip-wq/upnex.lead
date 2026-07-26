import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { name, email, password, role } = await req.json()

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Create auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? 'Failed to create user' }, { status: 400 })
  }

  // Insert into employees table
  const { data: employee, error: empError } = await adminClient
    .from('employees')
    .insert({
      user_id: authData.user.id,
      name,
      email,
      role,
    })
    .select()
    .single()

  if (empError) {
    // Clean up auth user if employee insert failed
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: empError.message }, { status: 400 })
  }

  return NextResponse.json({ employee })
}

export async function DELETE(req: NextRequest) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { employeeId, userId } = await req.json()

  if (userId) {
    await adminClient.auth.admin.deleteUser(userId)
  }

  await adminClient.from('employees').delete().eq('id', employeeId)

  return NextResponse.json({ success: true })
}
