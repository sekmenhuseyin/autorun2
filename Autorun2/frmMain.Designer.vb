<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmMain
    Inherits System.Windows.Forms.Form

    'Form overrides dispose to clean up the component list.
    <System.Diagnostics.DebuggerNonUserCode()> _
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Required by the Windows Form Designer
    Private components As System.ComponentModel.IContainer

    'NOTE: The following procedure is required by the Windows Form Designer
    'It can be modified using the Windows Form Designer.  
    'Do not modify it using the code editor.
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        Me.web1 = New System.Windows.Forms.WebBrowser()
        Me.SuspendLayout()
        '
        'web1
        '
        Me.web1.Dock = System.Windows.Forms.DockStyle.Fill
        Me.web1.IsWebBrowserContextMenuEnabled = False
        Me.web1.Location = New System.Drawing.Point(0, 0)
        Me.web1.MinimumSize = New System.Drawing.Size(20, 20)
        Me.web1.Name = "web1"
        Me.web1.ScriptErrorsSuppressed = True
        Me.web1.ScrollBarsEnabled = False
        Me.web1.Size = New System.Drawing.Size(1008, 730)
        Me.web1.TabIndex = 0
        Me.web1.WebBrowserShortcutsEnabled = False
        '
        'frmMain
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(1008, 730)
        Me.Controls.Add(Me.web1)
        Me.MinimumSize = New System.Drawing.Size(1024, 768)
        Me.Name = "frmMain"
        Me.Text = "Autorun"
        Me.ResumeLayout(False)

    End Sub
    Friend WithEvents web1 As System.Windows.Forms.WebBrowser

End Class
