const MakeButton = ({sendSecret, text}) => {

  return(
    <button className="make-button" onClick={sendSecret}>{text}</button>
  )
}

export default MakeButton