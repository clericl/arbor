import githubIcon from '../../assets/github-mark.png'
import './index.scss'

function Footer() {
  return (
    <div className="footer">
      © 2023 Eric Liang.
      <div className="icons">
        <div className="icon">
          <a href="https://www.github.com/clericl/arbor" target="_blank" rel="noreferrer noopener">
            <img src={githubIcon} alt="github" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default Footer
