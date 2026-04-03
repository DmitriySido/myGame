const MakeButton = ({sendSecret, text, disabled }) => {

  return(
    <button className="make-button" onClick={sendSecret} disabled={disabled}>{text}</button>
  )
}

export default MakeButton
