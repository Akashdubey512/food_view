import { NavLink } from 'react-router-dom'
import { AuthField, AuthFormCard, AuthHeroPanel, LockIcon, MailIcon, PasswordField, UserIcon } from '../../components/auth/AuthComponents'
import useAuthFlow from '../../context/useAuthFlow'

function resolveFieldIcon(fieldId) {
  if (fieldId === 'email') return 'email'
  if (fieldId === 'password') return 'password'
  return 'user'
}

const iconMap = {
  email: MailIcon,
  password: LockIcon,
  user: UserIcon,
}

const formCopy = {
  userRegister: {
    role: 'Customer account',
    title: 'Create your account',
    subtitle: 'Save favorites, discover nearby meals, and order with fewer taps.',
    heroTitle: 'Your next favorite meal, just a tap away',
    heroSubtitle: 'Browse cozy cafés, fresh plates, and chef specials in one calm experience.',
    heroMetrics: [
      { value: '4.9/5', label: 'Guest rating' },
      { value: '15k+', label: 'Weekly orders' },
      { value: '24/7', label: 'Support' },
    ],
    fields: [
      { id: 'name', label: 'Full name', type: 'text', placeholder: 'Alex Morgan', autoComplete: 'name' },
      { id: 'email', label: 'Email address', type: 'email', placeholder: 'alex@example.com', autoComplete: 'email' },
      { id: 'password', label: 'Password', type: 'password', placeholder: 'Create a password', autoComplete: 'new-password' },
    ],
    action: 'Create account',
    switchText: 'Already have an account?',
    switchLabel: 'Log in',
    switchTo: '/user/login',
  },
  userLogin: {
    role: 'Customer account',
    title: 'Welcome back',
    subtitle: 'Pick up where you left off and enjoy a faster, calmer checkout.',
    heroTitle: 'Welcome back to your favorite spots',
    heroSubtitle: 'Reopen your saved cafés, favorite bowls, and recent orders in a single place.',
    heroMetrics: [
      { value: '4.9/5', label: 'Guest rating' },
      { value: '12k+', label: 'Daily users' },
      { value: '2min', label: 'Average checkout' },
    ],
    fields: [
      { id: 'email', label: 'Email address', type: 'email', placeholder: 'alex@example.com', autoComplete: 'email' },
      { id: 'password', label: 'Password', type: 'password', placeholder: 'Your password', autoComplete: 'current-password' },
    ],
    action: 'Log in',
    switchText: 'New here?',
    switchLabel: 'Create an account',
    switchTo: '/user/register',
  },
  partnerRegister: {
    role: 'Food partner',
    title: 'Register your kitchen',
    subtitle: 'Bring your culinary brand online and start receiving orders with confidence.',
    heroTitle: 'Grow your kitchen with streamlined operations',
    heroSubtitle: 'Showcase fresh menus, respond quickly, and turn more curious guests into loyal regulars.',
    heroMetrics: [
      { value: '24/7', label: 'Order visibility' },
      { value: '98%', label: 'On-time handling' },
      { value: 'Live', label: 'Dashboard' },
    ],
    fields: [
      { id: 'businessName', label: 'Business name', type: 'text', placeholder: 'Harvest Kitchen', autoComplete: 'organization' },
      { id: 'ownerName', label: 'Owner name', type: 'text', placeholder: 'Jordan Lee', autoComplete: 'name' },
      { id: 'phone', label: 'Phone number', type: 'tel', placeholder: '+1 234 567 8900', autoComplete: 'tel' },
      { id: 'address', label: 'Address', type: 'text', placeholder: '123 Market Street, City', autoComplete: 'street-address' },
      { id: 'email', label: 'Email address', type: 'email', placeholder: 'team@harvest.com', autoComplete: 'email' },
      { id: 'password', label: 'Password', type: 'password', placeholder: 'Create a password', autoComplete: 'new-password' },
    ],
    action: 'Create partner account',
    switchText: 'Already registered?',
    switchLabel: 'Log in',
    switchTo: '/foodpartner/login',
  },
  partnerLogin: {
    role: 'Food partner',
    title: 'Partner login',
    subtitle: 'Access your dashboard and manage orders from a focused workspace.',
    heroTitle: 'Stay on top of every delivery detail',
    heroSubtitle: 'Keep menus, order flow, and guest communication organized without friction.',
    heroMetrics: [
      { value: 'Live', label: 'Order board' },
      { value: '1-click', label: 'Menu updates' },
      { value: 'Fast', label: 'Support' },
    ],
    fields: [
      { id: 'email', label: 'Email address', type: 'email', placeholder: 'team@harvest.com', autoComplete: 'email' },
      { id: 'password', label: 'Password', type: 'password', placeholder: 'Your password', autoComplete: 'current-password' },
    ],
    action: 'Log in',
    switchText: 'Joining as a partner?',
    switchLabel: 'Register kitchen',
    switchTo: '/foodpartner/register',
  },
}

function AuthPage({ variant = 'userLogin' ,onSubmit}) {
  const page = formCopy[variant] || formCopy.userLogin
  const { formData, updateFieldValue } = useAuthFlow()

  

  return (
    <main className="auth-shell">
      <nav className="auth-nav" aria-label="Auth navigation">
        <NavLink className="auth-nav__link" to="/user/login">
          Customer login
        </NavLink>
        <NavLink className="auth-nav__link" to="/user/register">
          Customer register
        </NavLink>
        <NavLink className="auth-nav__link" to="/foodpartner/login">
          Partner login
        </NavLink>
        <NavLink className="auth-nav__link" to="/foodpartner/register">
          Partner register
        </NavLink>
      </nav>

      <section className="auth-panel" aria-labelledby="auth-title">
        <AuthHeroPanel title={page.heroTitle} subtitle={page.heroSubtitle} metrics={page.heroMetrics} />

        <AuthFormCard
          actionLabel={page.action}
          onSubmit={onSubmit}
          subtitle={page.subtitle}
          switchLabel={page.switchLabel}
          switchText={page.switchText}
          switchTo={page.switchTo}
          title={page.title}
        >
          {page.fields.map((field) => {
            const sharedProps = {
              autoComplete: field.autoComplete,
              fieldId: field.id,
              label: field.label,
              onChange: (event) => updateFieldValue(field.id, event.target.value),
              placeholder: field.placeholder,
              type: field.type,
              value: formData[field.id] ?? '',
            }

            if (field.type === 'password') {
              return <PasswordField 
               key={field.id}
              {...sharedProps} />
            }

            const Icon = resolveFieldIcon(field.id)

            return <AuthField 
            key={field.id}
            {...sharedProps}
            icon={iconMap[Icon]} />
          })}
        </AuthFormCard>
      </section>
    </main>
  )
}

export default AuthPage
 