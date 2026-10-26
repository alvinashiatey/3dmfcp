import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root not found')
}

app.innerHTML = `
  <main>
    <h1>3D Modeling for a Creative Practice</h1>

    <p>
      This course examines how emerging technologies shape creative experiences through the production of artwork using 3D modeling and virtual representation. Students will learn to construct digital forms, apply textures, and employ realistic lighting techniques to animate their models. These models will subsequently be used to develop interactive and navigable environments, such as those found in video games and virtual reality applications, or combined with photographic imagery. The curriculum emphasizes individual project development and creative exploration, encouraging students to expand the boundaries of their artistic practice.
    </p>

    <nav aria-label="Course pages">
      <ul>
        <!-- Add links to course pages here. Example:
        <li><a href="/syllabus.html">Syllabus</a></li>
        -->
      </ul>
    </nav>
  </main>
`
