Public Class frmMain
    Private Sub frmMain_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        web1.Visible = False
        Me.BackgroundImage = System.Drawing.Image.FromFile("Autorun\Background.jpg")
    End Sub
End Class
